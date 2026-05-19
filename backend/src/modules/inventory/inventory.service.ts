import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityRepository,
  FilterQuery,
  LockMode,
  QueryOrder,
  wrap,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Inventory } from '@entities/inventory.entity';
import { InventoryMovement } from '@entities/inventory-movement.entity';
import { MovementType } from './enums/movement-type.enum';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementQueryDto } from './dto/movement-query.dto';
import { applyMovement } from './domain/apply-movement';
import {
  InsufficientStockError,
  InvalidMovementError,
  StockSnapshot,
} from './domain/stock-snapshot';

interface ApplyMovementContext {
  referenceId?: string;
  referenceType?: string;
  createdBy?: string;
  note?: string;
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: EntityRepository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: EntityRepository<InventoryMovement>,
  ) {}

  async getByVariantId(variantId: string, warehouseId?: string) {
    const inv = await this.inventoryRepo.findOne({ variantId, warehouseId });
    if (!inv) {
      throw new NotFoundException(
        `Không có tồn kho cho variant ${variantId}`,
      );
    }
    return this.toDto(inv);
  }

  async list(query: InventoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.em
      .createQueryBuilder(Inventory, 'i')
      .orderBy({ available: QueryOrder.ASC })
      .limit(limit)
      .offset((page - 1) * limit);

    if (query.warehouseId) {
      qb.andWhere({ warehouseId: query.warehouseId });
    }
    if (query.low_stock) {
      qb.andWhere('i.available <= i.low_stock_threshold');
    }

    const [items, total] = await qb.getResultAndCount();

    return {
      items: items.map((i) => this.toDto(i)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * S3-01 update: set absolute available = dto.quantity.
   * Tương đương 1 ADJUST movement → đi qua applyMovement để giữ invariant.
   */
  async setAbsolute(
    variantId: string,
    dto: UpdateInventoryDto,
    actorUserId?: string,
  ) {
    return this.applyMovementTx(
      {
        variantId,
        warehouseId: dto.warehouseId,
        type: MovementType.ADJUST,
        quantity: dto.quantity,
      },
      {
        createdBy: actorUserId,
        note: dto.note,
        referenceType: 'MANUAL',
      },
    );
  }

  // ---------- S3-02 ----------

  async createMovement(dto: CreateMovementDto, actorUserId?: string) {
    return this.applyMovementTx(
      {
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        type: dto.type,
        quantity: dto.quantity,
      },
      {
        createdBy: actorUserId,
        note: dto.note,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType ?? 'MANUAL',
      },
    );
  }

  async listMovements(query: MovementQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FilterQuery<InventoryMovement> = {};
    if (query.variantId) where.variantId = query.variantId;
    if (query.type) where.type = query.type;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.$gte = query.startDate;
      if (query.endDate) where.createdAt.$lte = query.endDate;
    }

    const [items, total] = await this.movementRepo.findAndCount(where, {
      orderBy: { createdAt: QueryOrder.DESC },
      limit,
      offset: (page - 1) * limit,
    });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ---------- internal API dùng cho Order (S5-01) ----------

  /**
   * Public method để OrderService gọi RESERVE/SELL/RELEASE trong cùng transaction.
   * Phải được gọi trong context `em.transactional(...)` của caller.
   */
  async applyMovementWithinTx(
    em: EntityManager,
    input: {
      variantId: string;
      warehouseId?: string;
      type: MovementType;
      quantity: number;
    },
    ctx: ApplyMovementContext,
  ) {
    return this.applyMovementImpl(em, input, ctx);
  }

  // ---------- internal helpers ----------

  private async applyMovementTx(
    input: {
      variantId: string;
      warehouseId?: string;
      type: MovementType;
      quantity: number;
    },
    ctx: ApplyMovementContext,
  ) {
    return this.em.transactional(async (em) =>
      this.applyMovementImpl(em, input, ctx),
    );
  }

  private async applyMovementImpl(
    em: EntityManager,
    input: {
      variantId: string;
      warehouseId?: string;
      type: MovementType;
      quantity: number;
    },
    ctx: ApplyMovementContext,
  ) {
    const inv = await this.lockOrCreate(em, input.variantId, input.warehouseId);

    const current: StockSnapshot = {
      available: inv.available,
      reserved: inv.reserved,
      sold: inv.sold,
    };

    let next: StockSnapshot;
    try {
      next = applyMovement(current, {
        type: input.type,
        quantity: input.quantity,
        variantId: input.variantId,
      });
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        throw new ConflictException(err.message);
      }
      if (err instanceof InvalidMovementError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    inv.available = next.available;
    inv.reserved = next.reserved;
    inv.sold = next.sold;

    const movement = em.create(InventoryMovement, {
      variantId: input.variantId,
      warehouseId: input.warehouseId,
      type: input.type,
      quantity: input.quantity,
      referenceId: ctx.referenceId,
      referenceType: ctx.referenceType,
      createdBy: ctx.createdBy,
      note: ctx.note,
    });

    em.persist(inv);
    em.persist(movement);
    await em.flush();

    return {
      inventory: this.toDto(inv),
      movement: wrap(movement).toJSON(),
    };
  }

  private async lockOrCreate(
    em: EntityManager,
    variantId: string,
    warehouseId?: string,
  ): Promise<Inventory> {
    const existing = await em.findOne(
      Inventory,
      { variantId, warehouseId },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
    if (existing) return existing;

    const created = em.create(Inventory, {
      variantId,
      warehouseId,
      available: 0,
      reserved: 0,
      sold: 0,
      lowStockThreshold: 10,
    });
    em.persist(created);
    await em.flush();
    return created;
  }

  private toDto(inv: Inventory) {
    return {
      id: inv.id,
      variantId: inv.variantId,
      warehouseId: inv.warehouseId,
      available: inv.available,
      reserved: inv.reserved,
      sold: inv.sold,
      lowStockThreshold: inv.lowStockThreshold,
      lowStock: inv.available <= inv.lowStockThreshold,
    };
  }
}

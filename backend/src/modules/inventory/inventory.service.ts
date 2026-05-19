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
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';

import { InventoryEntity } from '@entities/inventory.entity';
import { InventoryMovementEntity } from '@entities/inventory-movement.entity';

import { MovementType } from './enums/movement-type.enum';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementQueryDto } from './dto/movement-query.dto';
import {
  InsufficientStockError,
  InvalidMovementError,
  StockSnapshot,
  applyMovement,
} from './domain/apply-movement';

interface ApplyMovementContext {
  referenceId?: string;
  referenceType?: string;
  createdBy?: string;
  note?: string;
}

interface ApplyMovementInput {
  variantId: string;
  warehouseId?: string;
  type: MovementType;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: EntityRepository<InventoryEntity>,
    @InjectRepository(InventoryMovementEntity)
    private readonly movementRepo: EntityRepository<InventoryMovementEntity>,
  ) {}

  // ---------- S3-01 ----------

  async getByVariantId(variantId: string, warehouseId?: string) {
    const inv = await this.inventoryRepo.findOne({
      variantId,
      warehouseId: warehouseId ?? null,
    });
    if (!inv) {
      throw new NotFoundException(`Không có tồn kho cho variant ${variantId}`);
    }
    return this.toDto(inv);
  }

  async list(query: InventoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.em
      .createQueryBuilder(InventoryEntity, 'i')
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
   * PUT /inventory/:variantId — set available = dto.quantity through ADJUST movement.
   * Optional `lowStockThreshold` updates the threshold in same transaction.
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
      dto.lowStockThreshold,
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

    const where: FilterQuery<InventoryMovementEntity> = {};
    if (query.variantId) (where as any).variantId = query.variantId;
    if (query.type) (where as any).type = query.type;
    if (query.startDate || query.endDate) {
      (where as any).createdAt = {};
      if (query.startDate) (where as any).createdAt.$gte = query.startDate;
      if (query.endDate) (where as any).createdAt.$lte = query.endDate;
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

  // ---------- internal API for Cart / Order ----------

  /**
   * Called by Cart/Order services within their own transaction. Caller passes
   * its EntityManager fork so the movement participates in the same tx.
   */
  async applyMovementWithinTx(
    em: EntityManager,
    input: ApplyMovementInput,
    ctx: ApplyMovementContext,
  ) {
    return this.applyMovementImpl(em, input, ctx);
  }

  /**
   * Read current available without locking — for cart stock validation.
   */
  async getAvailable(em: EntityManager, variantId: string, warehouseId?: string) {
    const inv = await em.findOne(InventoryEntity, {
      variantId,
      warehouseId: warehouseId ?? null,
    });
    return inv?.available ?? 0;
  }

  // ---------- internals ----------

  private async applyMovementTx(
    input: ApplyMovementInput,
    ctx: ApplyMovementContext,
    newLowStockThreshold?: number,
  ) {
    return this.em.transactional(async (em) =>
      this.applyMovementImpl(em, input, ctx, newLowStockThreshold),
    );
  }

  private async applyMovementImpl(
    em: EntityManager,
    input: ApplyMovementInput,
    ctx: ApplyMovementContext,
    newLowStockThreshold?: number,
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
    if (newLowStockThreshold !== undefined) {
      inv.lowStockThreshold = newLowStockThreshold;
    }

    const movement = em.create(InventoryMovementEntity, {
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
      movement: {
        id: movement.id,
        variantId: movement.variantId,
        warehouseId: movement.warehouseId,
        type: movement.type,
        quantity: movement.quantity,
        referenceId: movement.referenceId,
        referenceType: movement.referenceType,
        createdBy: movement.createdBy,
        note: movement.note,
        createdAt: movement.createdAt,
      },
    };
  }

  private async lockOrCreate(
    em: EntityManager,
    variantId: string,
    warehouseId?: string,
  ): Promise<InventoryEntity> {
    const existing = await em.findOne(
      InventoryEntity,
      { variantId, warehouseId: warehouseId ?? null },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
    if (existing) return existing;

    const created = em.create(InventoryEntity, {
      variantId,
      warehouseId: warehouseId ?? undefined,
      available: 0,
      reserved: 0,
      sold: 0,
      lowStockThreshold: 10,
    });
    em.persist(created);
    await em.flush();
    return created;
  }

  private toDto(inv: InventoryEntity) {
    return {
      id: inv.id,
      variantId: inv.variantId,
      warehouseId: inv.warehouseId,
      available: inv.available,
      reserved: inv.reserved,
      sold: inv.sold,
      lowStockThreshold: inv.lowStockThreshold,
      lowStock: inv.available <= inv.lowStockThreshold,
      updatedAt: inv.updatedAt,
    };
  }
}

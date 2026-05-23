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

interface StockSnapshot {
  available: number;
  reserved: number;
  sold: number;
}

interface ApplyMovementContext {
  referenceId?: string;
  note?: string;
}

interface ApplyMovementInput {
  variantId: string;
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

  async getByVariantId(variantId: string) {
    const inv = await this.inventoryRepo.findOne({ variantId });
    if (!inv) {
      throw new NotFoundException(`Inventory not found for variant ${variantId}`);
    }
    return this.toDto(inv);
  }

  async list(query: InventoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.inventoryRepo.findAndCount(
      {},
      {
        orderBy: { available: QueryOrder.ASC },
        limit,
        offset: (page - 1) * limit,
      },
    );

    return {
      items: items.map((i) => this.toDto(i)),
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async setAbsolute(
    variantId: string,
    dto: UpdateInventoryDto,
  ) {
    return this.applyMovementTx(
      {
        variantId,
        type: MovementType.ADJUST,
        quantity: dto.quantity,
      },
      {
        note: dto.note,
      },
    );
  }

  async createMovement(dto: CreateMovementDto) {
    return this.applyMovementTx(
      {
        variantId: dto.variantId,
        type: dto.type,
        quantity: dto.quantity,
      },
      {
        note: dto.note,
        referenceId: dto.referenceId,
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
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async applyMovementWithinTx(
    em: EntityManager,
    input: ApplyMovementInput,
    ctx: ApplyMovementContext,
  ) {
    return this.applyMovementImpl(em, input, ctx);
  }

  async getAvailable(em: EntityManager, variantId: string) {
    const inv = await em.findOne(InventoryEntity, { variantId });
    return inv?.available ?? 0;
  }

  private async applyMovementTx(
    input: ApplyMovementInput,
    ctx: ApplyMovementContext,
  ) {
    return this.em.transactional(async (em) =>
      this.applyMovementImpl(em, input, ctx),
    );
  }

  private async applyMovementImpl(
    em: EntityManager,
    input: ApplyMovementInput,
    ctx: ApplyMovementContext,
  ) {
    const inv = await this.lockOrCreate(em, input.variantId);

    const current: StockSnapshot = {
      available: inv.available,
      reserved: inv.reserved,
      sold: inv.sold,
    };

    const next = this.calcNextStock(current, input.type, input.quantity, input.variantId);

    inv.available = next.available;
    inv.reserved = next.reserved;
    inv.sold = next.sold;

    const movement = em.create(InventoryMovementEntity, {
      variantId: input.variantId,
      type: input.type,
      quantity: input.quantity,
      referenceId: ctx.referenceId,
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
        type: movement.type,
        quantity: movement.quantity,
        referenceId: movement.referenceId,
        note: movement.note,
        createdAt: movement.createdAt,
      },
    };
  }

  private calcNextStock(
    current: StockSnapshot,
    type: MovementType,
    quantity: number,
    variantId: string,
  ): StockSnapshot {
    if (!Number.isFinite(quantity)) {
      throw new BadRequestException(
        `Invalid quantity for variant ${variantId}`,
      );
    }

    switch (type) {
      case MovementType.IMPORT:
        if (quantity <= 0) {
          throw new BadRequestException('IMPORT quantity must be > 0');
        }
        return { ...current, available: current.available + quantity };
      case MovementType.RESERVE:
        if (quantity <= 0) {
          throw new BadRequestException('RESERVE quantity must be > 0');
        }
        if (current.available < quantity) {
          throw new ConflictException(
            `Insufficient stock for variant ${variantId}: need ${quantity}, available ${current.available}`,
          );
        }
        return {
          ...current,
          available: current.available - quantity,
          reserved: current.reserved + quantity,
        };
      case MovementType.RELEASE:
        if (quantity <= 0) {
          throw new BadRequestException('RELEASE quantity must be > 0');
        }
        if (current.reserved < quantity) {
          throw new BadRequestException(
            `Cannot RELEASE ${quantity}: reserved is only ${current.reserved}`,
          );
        }
        return {
          ...current,
          reserved: current.reserved - quantity,
          available: current.available + quantity,
        };
      case MovementType.SELL:
        if (quantity <= 0) {
          throw new BadRequestException('SELL quantity must be > 0');
        }
        if (current.reserved < quantity) {
          throw new BadRequestException(
            `Cannot SELL ${quantity}: reserved is only ${current.reserved}`,
          );
        }
        return {
          ...current,
          reserved: current.reserved - quantity,
          sold: current.sold + quantity,
        };
      case MovementType.ADJUST:
        if (quantity < 0) {
          throw new BadRequestException('ADJUST quantity must be >= 0');
        }
        return { ...current, available: quantity };
      default:
        throw new BadRequestException(
          `Invalid movement type: ${String(type)}`,
        );
    }
  }

  private async lockOrCreate(
    em: EntityManager,
    variantId: string,
  ): Promise<InventoryEntity> {
    const existing = await em.findOne(
      InventoryEntity,
      { variantId },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
    if (existing) return existing;

    const created = em.create(InventoryEntity, {
      variantId,
      available: 0,
      reserved: 0,
      sold: 0,
    });
    em.persist(created);
    await em.flush();
    return created;
  }

  private toDto(inv: InventoryEntity) {
    return {
      id: inv.id,
      variantId: inv.variantId,
      available: inv.available,
      reserved: inv.reserved,
      sold: inv.sold,
      updatedAt: inv.updatedAt,
    };
  }
}

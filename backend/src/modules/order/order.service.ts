import {
  ConflictException,
  ForbiddenException,
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

import { OrderEntity } from '@entities/order.entity';
import { OrderItemEntity } from '@entities/order-item.entity';
import { OrderStatusHistoryEntity } from '@entities/order-status-history.entity';

import { OrderStatus } from './enums/order-status.enum';
import { OrderActor } from './enums/order-actor.enum';
import {
  InvalidOrderTransitionError,
  transitionOrderStatus,
} from './domain/order-status-transition';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';

import { CartService } from '@modules/cart/cart.service';
import { InventoryService } from '@modules/inventory/inventory.service';
import { MovementType } from '@modules/inventory/enums/movement-type.enum';

interface ApplyTransitionInput {
  orderId: string;
  targetStatus: OrderStatus;
  actor: OrderActor;
  actorUserId?: string;
  note?: string;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: EntityRepository<OrderEntity>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
  ) {}

  // ---------- S5-01 ----------

  async create(userId: string, dto: CreateOrderDto) {
    return this.em.transactional(async (em) => {
      const cart = await this.cartService.getActiveCartForCheckout(em, userId);
      const items = cart.items.getItems();

      const order = em.create(OrderEntity, {
        userId,
        status: OrderStatus.PENDING,
        subtotal: 0,
        voucherCode: dto.voucherCode,
        discountAmount: 0,
        totalPrice: 0,
        shippingAddress: dto.shippingAddress,
        phone: dto.phone,
        note: dto.note,
      });
      em.persist(order);
      await em.flush(); // need order.id before referencing in movements

      let subtotalNum = 0;
      for (const ci of items) {
        await this.inventoryService.applyMovementWithinTx(
          em,
          {
            variantId: ci.variantId,
            type: MovementType.RESERVE,
            quantity: ci.quantity,
          },
          {
            referenceId: order.id,
            referenceType: 'ORDER',
            createdBy: userId,
            note: `RESERVE for order ${order.id}`,
          },
        );

        const livePrice = await this.cartService.resolveCurrentPriceFor(
          em,
          ci.variantId,
        );
        const itemSubtotal = Number((livePrice * ci.quantity).toFixed(2));
        subtotalNum += itemSubtotal;

        em.persist(
          em.create(OrderItemEntity, {
            order,
            variantId: ci.variantId,
            quantity: ci.quantity,
            price: livePrice,
            subtotal: itemSubtotal,
          }),
        );
      }

      const subtotal = Number(subtotalNum.toFixed(2));
      order.subtotal = subtotal;
      order.totalPrice = subtotal;

      em.persist(
        em.create(OrderStatusHistoryEntity, {
          order,
          fromStatus: undefined,
          toStatus: OrderStatus.PENDING,
          changedByActor: OrderActor.USER,
          changedByUserId: userId,
          note: 'Order created',
        }),
      );

      this.cartService.markCheckedOut(cart);
      em.persist(cart);

      await em.flush();
      await em.populate(order, ['items', 'statusHistory']);
      return this.toDto(order);
    });
  }

  // ---------- S5-02 ----------

  async list(
    requesterUserId: string,
    isAdmin: boolean,
    query: OrderQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FilterQuery<OrderEntity> = {};
    if (!isAdmin) {
      (where as any).userId = requesterUserId;
    } else if (query.userId) {
      (where as any).userId = query.userId;
    }
    if (query.status) (where as any).status = query.status;
    if (query.startDate || query.endDate) {
      (where as any).createdAt = {};
      if (query.startDate) (where as any).createdAt.$gte = query.startDate;
      if (query.endDate) (where as any).createdAt.$lte = query.endDate;
    }

    const [items, total] = await this.orderRepo.findAndCount(where, {
      orderBy: { createdAt: QueryOrder.DESC },
      limit,
      offset: (page - 1) * limit,
      populate: ['items'],
    });

    return {
      items: items.map((o) => this.toDto(o)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(requesterUserId: string, isAdmin: boolean, orderId: string) {
    const order = await this.orderRepo.findOne(
      { id: orderId },
      { populate: ['items', 'statusHistory'] },
    );
    if (!order) {
      throw new NotFoundException(`Không tìm thấy order ${orderId}`);
    }
    if (!isAdmin && order.userId !== requesterUserId) {
      throw new ForbiddenException('Order không thuộc về user này');
    }
    return this.toDto(order);
  }

  // ---------- S5-03 ----------

  async updateStatus(
    actorUserId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    return this.applyTransition({
      orderId,
      targetStatus: dto.status,
      actor: OrderActor.ADMIN,
      actorUserId,
      note: dto.note,
    });
  }

  async bulkUpdateStatus(
    actorUserId: string,
    orderIds: string[],
    targetStatus: OrderStatus,
    note?: string,
  ) {
    const succeeded: string[] = [];
    const failed: Array<{ orderId: string; reason: string }> = [];

    for (const id of orderIds) {
      try {
        await this.applyTransition({
          orderId: id,
          targetStatus,
          actor: OrderActor.ADMIN,
          actorUserId,
          note,
        });
        succeeded.push(id);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        failed.push({ orderId: id, reason });
      }
    }

    return {
      total: orderIds.length,
      succeededCount: succeeded.length,
      failedCount: failed.length,
      succeeded,
      failed,
    };
  }

  async cancelByUser(userId: string, orderId: string, note?: string) {
    const order = await this.em.findOne(OrderEntity, { id: orderId });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy order ${orderId}`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('Không có quyền huỷ order này');
    }
    return this.applyTransition({
      orderId,
      targetStatus: OrderStatus.CANCELLED,
      actor: OrderActor.USER,
      actorUserId: userId,
      note: note ?? 'Cancelled by customer',
    });
  }

  /** Internal: SYSTEM actor — called by payment webhook to mark as paid. */
  async markPaidBySystem(orderId: string, note?: string) {
    return this.applyTransition({
      orderId,
      targetStatus: OrderStatus.PAID,
      actor: OrderActor.SYSTEM,
      actorUserId: undefined,
      note: note ?? 'Payment confirmed',
    });
  }

  // ---------- internals ----------

  private async applyTransition(input: ApplyTransitionInput) {
    return this.em.transactional(async (em) => {
      const order = await em.findOne(
        OrderEntity,
        { id: input.orderId },
        { lockMode: LockMode.PESSIMISTIC_WRITE, populate: ['items'] },
      );
      if (!order) {
        throw new NotFoundException(`Không tìm thấy order ${input.orderId}`);
      }

      const from = order.status;
      let to: OrderStatus;
      try {
        to = transitionOrderStatus(from, input.targetStatus, input.actor);
      } catch (err) {
        if (err instanceof InvalidOrderTransitionError) {
          throw new ConflictException(err.message);
        }
        throw err;
      }

      await this.applyInventorySideEffects(
        em,
        order,
        from,
        to,
        input.actorUserId ?? 'system',
      );

      order.status = to;
      this.stampTimestamp(order, to);

      em.persist(
        em.create(OrderStatusHistoryEntity, {
          order,
          fromStatus: from,
          toStatus: to,
          changedByActor: input.actor,
          changedByUserId: input.actorUserId,
          note: input.note,
        }),
      );

      await em.flush();
      await em.populate(order, ['items', 'statusHistory']);
      return this.toDto(order);
    });
  }

  private async applyInventorySideEffects(
    em: EntityManager,
    order: OrderEntity,
    from: OrderStatus,
    to: OrderStatus,
    actorUserId: string,
  ) {
    const movementType = this.resolveMovementType(from, to);
    if (!movementType) return;

    const items = order.items.getItems();
    for (const it of items) {
      await this.inventoryService.applyMovementWithinTx(
        em,
        {
          variantId: it.variantId,
          type: movementType,
          quantity: it.quantity,
        },
        {
          referenceId: order.id,
          referenceType: 'ORDER',
          createdBy: actorUserId,
          note: `${movementType} for ${from}→${to}`,
        },
      );
    }
  }

  private resolveMovementType(
    _from: OrderStatus,
    to: OrderStatus,
  ): MovementType | null {
    if (to === OrderStatus.COMPLETED) return MovementType.SELL;
    if (to === OrderStatus.CANCELLED) return MovementType.RELEASE;
    return null;
  }

  private stampTimestamp(order: OrderEntity, status: OrderStatus) {
    const now = new Date();
    if (status === OrderStatus.PAID) order.paidAt = now;
    if (status === OrderStatus.SHIPPED) order.shippedAt = now;
    if (status === OrderStatus.COMPLETED) order.completedAt = now;
    if (status === OrderStatus.CANCELLED) order.cancelledAt = now;
  }

  private toDto(order: OrderEntity) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      subtotal: Number(order.subtotal),
      voucherCode: order.voucherCode,
      discountAmount: Number(order.discountAmount),
      totalPrice: Number(order.totalPrice),
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      note: order.note,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.isInitialized()
        ? order.items.getItems().map((i) => ({
            id: i.id,
            variantId: i.variantId,
            quantity: i.quantity,
            price: Number(i.price),
            subtotal: Number(i.subtotal),
          }))
        : undefined,
      timeline: order.statusHistory?.isInitialized()
        ? order.statusHistory.getItems().map((h) => ({
            fromStatus: h.fromStatus ?? null,
            toStatus: h.toStatus,
            actor: h.changedByActor,
            changedByUserId: h.changedByUserId,
            note: h.note,
            at: h.createdAt,
          }))
        : undefined,
    };
  }
}

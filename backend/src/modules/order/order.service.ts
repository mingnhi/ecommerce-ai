import {
  BadRequestException,
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
import { EntityManager } from '@mikro-orm/core';

import { OrderEntity } from '@entities/order.entity';
import { OrderItemEntity } from '@entities/order-item.entity';
import { Payment } from '@entities/payment.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductImageType } from '@entities/product-image.entity';

import { OrderStatus } from './enums/order-status.enum';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';

import { CartService } from '@modules/cart/cart.service';
import { InventoryService } from '@modules/inventory/inventory.service';
import { MovementType } from '@modules/inventory/enums/movement-type.enum';

interface ApplyTransitionInput {
  orderId: string;
  targetStatus: OrderStatus;
  isAdmin: boolean;
  actorUserId?: string;
  note?: string;
}

const USER_ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
};

@Injectable()
export class OrderService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: EntityRepository<OrderEntity>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
  ) { }

  async create(userId: string, dto: CreateOrderDto) {
    return this.em.transactional(async (em) => {
      const cart = await this.cartService.getActiveCartForCheckout(em, userId);
      const cartItems = cart.items.getItems();
      const selectedIds = new Set(dto.cartItemIds);
      const items = cartItems.filter((item) => selectedIds.has(item.id));

      if (items.length !== dto.cartItemIds.length) {
        throw new BadRequestException('Some cart items are invalid');
      }

      if (items.length === 0) {
        throw new BadRequestException('No cart items selected for checkout');
      }

      const order = em.create(OrderEntity, {
        userId,
        status: OrderStatus.PENDING,
        totalPrice: 0,
        shippingAddress: dto.shippingAddress,
        phone: dto.phone,
        note: dto.note,
      });
      em.persist(order);
      await em.flush();

      let total = 0;
      for (const ci of items) {
        // Tạm tắt giữ tồn kho khi đặt hàng — bật lại khi có nhập kho
        // await this.inventoryService.applyMovementWithinTx(
        //   em,
        //   {
        //     variantId: ci.variantId,
        //     type: MovementType.RESERVE,
        //     quantity: ci.quantity,
        //   },
        //   {
        //     referenceId: order.id,
        //     note: `RESERVE for order ${order.id}`,
        //   },
        // );

        const livePrice = await this.cartService.resolveCurrentPriceFor(
          em,
          ci.variantId,
        );
        total += livePrice * ci.quantity;

        em.persist(
          em.create(OrderItemEntity, {
            order,
            variantId: ci.variantId,
            quantity: ci.quantity,
            price: livePrice,
          }),
        );
      }

      order.totalPrice = Number(total.toFixed(2));

      for (const item of items) {
        em.remove(item);
      }

      if (items.length === cartItems.length) {
        this.cartService.markCheckedOut(cart);
      }

      em.persist(cart);

      await em.flush();
      await em.populate(order, ['items']);
      const variantMap = await this.loadVariantMap(em, [order]);
      return this.toDto(order, variantMap);
    });
  }

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

    const variantMap = await this.loadVariantMap(this.em, items);

    return {
      items: items.map((o) => this.toDto(o, variantMap)),
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

  async getById(requesterUserId: string, isAdmin: boolean, orderId: string) {
    const order = await this.orderRepo.findOne(
      { id: orderId },
      { populate: ['items'] },
    );
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    if (!isAdmin && order.userId !== requesterUserId) {
      throw new ForbiddenException('Order does not belong to this user');
    }
    const variantMap = await this.loadVariantMap(this.em, [order]);
    return this.toDto(order, variantMap);
  }

  async updateStatus(
    actorUserId: string,
    isAdmin: boolean,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    if (!isAdmin) {
      const order = await this.em.findOne(OrderEntity, { id: orderId });
      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }
      if (order.userId !== actorUserId) {
        throw new ForbiddenException('Order does not belong to this user');
      }
    }

    return this.applyTransition({
      orderId,
      targetStatus: dto.status,
      isAdmin,
      actorUserId,
      note: dto.note,
    });
  }

  async remove(orderId: string) {
    return this.em.transactional(async (em) => {
      const order = await em.findOne(
        OrderEntity,
        { id: orderId },
        { populate: ['items'] },
      );
      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      const payments = await em.find(Payment, { order: orderId });
      payments.forEach((payment) => em.remove(payment));
      order.items.getItems().forEach((item) => em.remove(item));
      em.remove(order);
      await em.flush();

      return { message: 'Delete order successfully' };
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
          isAdmin: true,
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

  private async applyTransition(input: ApplyTransitionInput) {
    return this.em.transactional(async (em) => {
      const order = await em.findOne(
        OrderEntity,
        { id: input.orderId },
        { lockMode: LockMode.PESSIMISTIC_WRITE, populate: ['items'] },
      );
      if (!order) {
        throw new NotFoundException(`Order ${input.orderId} not found`);
      }

      const from = order.status;
      const to = input.targetStatus;

      if (from === to) {
        const variantMap = await this.loadVariantMap(em, [order]);
        return this.toDto(order, variantMap);
      }

      if (!input.isAdmin) {
        const allowed = USER_ALLOWED_TRANSITIONS[from];
        if (!allowed?.includes(to)) {
          throw new ConflictException(
            `Cannot transition order from ${from} to ${to}`,
          );
        }
      }

      await this.applyInventorySideEffects(
        em,
        order,
        from,
        to,
        input.actorUserId ?? 'system',
      );

      order.status = to;

      await em.flush();
      await em.populate(order, ['items']);
      const variantMap = await this.loadVariantMap(em, [order]);
      return this.toDto(order, variantMap);
    });
  }

  private async applyInventorySideEffects(
    _em: EntityManager,
    _order: OrderEntity,
    _from: OrderStatus,
    _to: OrderStatus,
    _actorUserId: string,
  ) {
    // Tạm tắt cập nhật tồn kho khi đổi trạng thái đơn — bật lại khi có nhập kho
    return;

    // const movementType = this.resolveMovementType(from, to);
    // if (!movementType) return;
    //
    // const items = order.items.getItems();
    // for (const it of items) {
    //   await this.inventoryService.applyMovementWithinTx(
    //     em,
    //     {
    //       variantId: it.variantId,
    //       type: movementType,
    //       quantity: it.quantity,
    //     },
    //     {
    //       referenceId: order.id,
    //       note: `${movementType} for ${from}->${to} by ${actorUserId}`,
    //     },
    //   );
    // }
  }

  private resolveMovementType(
    _from: OrderStatus,
    to: OrderStatus,
  ): MovementType | null {
    if (to === OrderStatus.COMPLETED) return MovementType.SELL;
    if (to === OrderStatus.CANCELLED) return MovementType.RELEASE;
    return null;
  }

  private async loadVariantMap(
    em: EntityManager,
    orders: OrderEntity[],
  ): Promise<Map<string, ProductVariantEntity>> {
    const variantIds = [
      ...new Set(
        orders.flatMap((order) =>
          order.items.isInitialized()
            ? order.items.getItems().map((item) => item.variantId)
            : [],
        ),
      ),
    ];

    if (!variantIds.length) {
      return new Map();
    }

    const variants = await em.find(
      ProductVariantEntity,
      { id: { $in: variantIds } },
      { populate: ['product', 'product.images'] },
    );

    return new Map(variants.map((variant) => [variant.id, variant]));
  }

  private toDto(
    order: OrderEntity,
    variantMap: Map<string, ProductVariantEntity>,
  ) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      note: order.note,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.isInitialized()
        ? order.items.getItems().map((i) => this.mapOrderItem(i, variantMap))
        : undefined,
    };
  }

  private mapOrderItem(
    item: OrderItemEntity,
    variantMap: Map<string, ProductVariantEntity>,
  ) {
    const variant = variantMap.get(item.variantId);
    const { productName, thumbnail } = this.resolveVariantDisplay(variant);

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.price),
      productName,
      thumbnail,
    };
  }

  private resolveVariantDisplay(variant?: ProductVariantEntity) {
    if (!variant) {
      return { productName: 'Sản phẩm', thumbnail: undefined };
    }

    const productName =
      variant.product?.name?.trim() ||
      variant.title?.trim() ||
      'Sản phẩm';

    let thumbnail = variant.image?.trim() || undefined;
    const images = variant.product?.images;

    if (!thumbnail && images?.isInitialized()) {
      const list = images.getItems();
      const thumb = list.find((img) => img.type === ProductImageType.THUMBNAIL);
      thumbnail = thumb?.imageUrl ?? list[0]?.imageUrl;
    }

    return { productName, thumbnail };
  }
}

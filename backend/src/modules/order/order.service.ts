// import {
//   BadRequestException,
//   ConflictException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@mikro-orm/nestjs';
// import {
//   EntityRepository,
//   FilterQuery,
//   LockMode,
//   QueryOrder,
// } from '@mikro-orm/core';
// import { EntityManager } from '@mikro-orm/mysql';
// import { Order } from '@entities/order.entity';
// import { OrderItem } from '@entities/order-item.entity';
// import { OrderStatusHistory } from '@entities/order-status-history.entity';
// import { OrderStatus } from './enums/order-status.enum';
// import {
//   InvalidOrderTransitionError,
//   OrderActor,
//   transitionOrderStatus,
// } from './domain/order-status-transition';
// import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
// import { OrderQueryDto } from './dto/order-query.dto';
// import { CartService } from '@modules/cart/cart.service';
// import { InventoryService } from '@modules/inventory/inventory.service';
// import { MovementType } from '@modules/inventory/enums/movement-type.enum';
// import { VoucherService } from '@modules/voucher/voucher.service';
// import { AuditService } from '@modules/audit/audit.service';

// @Injectable()
// export class OrderService {
//   constructor(
//     private readonly em: EntityManager,
//     @InjectRepository(Order)
//     private readonly orderRepo: EntityRepository<Order>,
//     private readonly cartService: CartService,
//     private readonly inventoryService: InventoryService,
//     private readonly voucherService: VoucherService,
//     private readonly auditService: AuditService,
//   ) {}

//   /**
//    * S5-01: Tạo đơn hàng atomic.
//    *   1. Lock cart active của user
//    *   2. RESERVE stock từng item (transactional, có thể fail nếu hết hàng)
//    *   3. Tạo Order + OrderItem snapshot
//    *   4. Mark cart CHECKED_OUT
//    *   5. Ghi OrderStatusHistory (PENDING)
//    */
//   async create(userId: string, dto: CreateOrderDto) {
//     return this.em.transactional(async (em) => {
//       const cart = await this.cartService.getActiveCartForCheckout(em, userId);

//       const items = cart.items.getItems();
//       let subtotalNum = 0;

//       const order = em.create(Order, {
//         userId,
//         status: OrderStatus.PENDING,
//         subtotal: '0.00',
//         discountAmount: '0.00',
//         totalPrice: '0.00',
//         shippingAddress: dto.shippingAddress,
//         phone: dto.phone,
//         note: dto.note,
//       });
//       em.persist(order);
//       await em.flush(); // cần id trước khi reference vào movement

//       for (const ci of items) {
//         await this.inventoryService.applyMovementWithinTx(
//           em,
//           {
//             variantId: ci.variantId,
//             type: MovementType.RESERVE,
//             quantity: ci.quantity,
//           },
//           {
//             referenceId: order.id,
//             referenceType: 'ORDER',
//             createdBy: userId,
//             note: `RESERVE for order ${order.id}`,
//           },
//         );

//         const priceNum = Number(ci.priceAtTime);
//         const itemSubtotal = priceNum * ci.quantity;
//         subtotalNum += itemSubtotal;

//         em.persist(
//           em.create(OrderItem, {
//             order,
//             variantId: ci.variantId,
//             quantity: ci.quantity,
//             price: ci.priceAtTime,
//             subtotal: itemSubtotal.toFixed(2),
//           }),
//         );
//       }

//       order.subtotal = subtotalNum.toFixed(2);

//       // Apply voucher trong cùng transaction (lock + consume usage)
//       let discountNum = 0;
//       if (dto.voucherCode) {
//         const applied = await this.voucherService.applyAndConsumeWithinTx(
//           em,
//           dto.voucherCode,
//           order.subtotal,
//         );
//         discountNum = Number(applied.discountAmount);
//         order.discountAmount = applied.discountAmount;
//         order.voucherCode = applied.code;
//       }

//       const totalNum = Math.max(0, subtotalNum - discountNum);
//       order.totalPrice = totalNum.toFixed(2);

//       em.persist(
//         em.create(OrderStatusHistory, {
//           order,
//           fromStatus: undefined,
//           toStatus: OrderStatus.PENDING,
//           changedByActor: OrderActor.USER,
//           changedByUserId: userId,
//           note: 'Order created',
//         }),
//       );

//       this.cartService.markCheckedOut(cart);
//       em.persist(cart);

//       await em.flush();
//       await em.populate(order, ['items', 'statusHistory']);
//       return this.toDto(order);
//     });
//   }

//   // ---------- S5-02 ----------

//   async list(
//     requesterUserId: string,
//     isAdmin: boolean,
//     query: OrderQueryDto,
//   ) {
//     const page = query.page ?? 1;
//     const limit = query.limit ?? 20;

//     const where: FilterQuery<Order> = {};
//     if (!isAdmin) {
//       where.userId = requesterUserId;
//     } else if (query.userId) {
//       where.userId = query.userId;
//     }
//     if (query.status) where.status = query.status;
//     if (query.startDate || query.endDate) {
//       where.createdAt = {};
//       if (query.startDate) where.createdAt.$gte = query.startDate;
//       if (query.endDate) where.createdAt.$lte = query.endDate;
//     }

//     const [items, total] = await this.orderRepo.findAndCount(where, {
//       orderBy: { createdAt: QueryOrder.DESC },
//       limit,
//       offset: (page - 1) * limit,
//       populate: ['items'],
//     });

//     return {
//       items: items.map((o) => this.toDto(o)),
//       meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     };
//   }

//   async getById(requesterUserId: string, isAdmin: boolean, orderId: string) {
//     const order = await this.orderRepo.findOne(
//       { id: orderId },
//       { populate: ['items', 'statusHistory'] },
//     );
//     if (!order) throw new NotFoundException(`Không tìm thấy order ${orderId}`);
//     if (!isAdmin && order.userId !== requesterUserId) {
//       throw new ForbiddenException('Order không thuộc về user này');
//     }
//     return this.toDto(order);
//   }

//   // ---------- S5-03 ----------

//   /**
//    * Admin cập nhật status. Validate qua state machine, ghi history,
//    * và phát sinh inventory movement tương ứng:
//    *   *→COMPLETED        : SELL (reserved → sold)
//    *   *→CANCELLED        : RELEASE (reserved → available)
//    *   PAID/SHIPPED→REFUNDED : RELEASE
//    *   COMPLETED→REFUNDED   : IMPORT (restock)
//    */
//   async updateStatus(
//     actorUserId: string,
//     isAdmin: boolean,
//     orderId: string,
//     dto: UpdateOrderStatusDto,
//   ) {
//     if (!isAdmin) {
//       throw new ForbiddenException('Chỉ admin được cập nhật trạng thái đơn');
//     }
//     return this.applyTransition({
//       orderId,
//       targetStatus: dto.status,
//       actor: OrderActor.ADMIN,
//       actorUserId,
//       note: dto.note,
//     });
//   }

//   /**
//    * Bulk update status — admin chọn nhiều đơn cùng status.
//    * Apply transition cho từng order; nếu order nào không hợp lệ → skip với error.
//    * Trả về { succeeded, failed } để admin biết kết quả.
//    */
//   async bulkUpdateStatus(
//     actorUserId: string,
//     orderIds: string[],
//     targetStatus: OrderStatus,
//     note?: string,
//   ) {
//     const succeeded: string[] = [];
//     const failed: Array<{ orderId: string; reason: string }> = [];

//     for (const id of orderIds) {
//       try {
//         await this.applyTransition({
//           orderId: id,
//           targetStatus,
//           actor: OrderActor.ADMIN,
//           actorUserId,
//           note,
//         });
//         succeeded.push(id);
//       } catch (err) {
//         const reason = err instanceof Error ? err.message : String(err);
//         failed.push({ orderId: id, reason });
//       }
//     }

//     return {
//       total: orderIds.length,
//       succeededCount: succeeded.length,
//       failedCount: failed.length,
//       succeeded,
//       failed,
//     };
//   }

//   /**
//    * Internal API cho PaymentService gọi khi PayPal capture / COD confirm xong.
//    * SYSTEM actor được phép trigger PENDING→PAID (theo state machine).
//    */
//   async markPaidBySystem(orderId: string) {
//     return this.applyTransition({
//       orderId,
//       targetStatus: OrderStatus.PAID,
//       actor: OrderActor.SYSTEM,
//       actorUserId: undefined,
//       note: 'Payment confirmed',
//     });
//   }

//   /**
//    * Customer self-cancel — chỉ cho phép khi order còn PENDING.
//    * State machine sẽ reject nếu order đã PAID/SHIPPED/COMPLETED/CANCELLED/REFUNDED.
//    */
//   async cancelByUser(userId: string, orderId: string, note?: string) {
//     const order = await this.em.findOne(Order, { id: orderId });
//     if (!order) {
//       throw new NotFoundException(`Không tìm thấy order ${orderId}`);
//     }
//     if (order.userId !== userId) {
//       throw new ForbiddenException('Không có quyền huỷ đơn hàng này');
//     }
//     return this.applyTransition({
//       orderId,
//       targetStatus: OrderStatus.CANCELLED,
//       actor: OrderActor.USER,
//       actorUserId: userId,
//       note: note ?? 'Cancelled by customer',
//     });
//   }

//   /**
//    * Internal API cho PaymentService refund flow.
//    * ADMIN actor transition tới REFUNDED, side-effect inventory tự động.
//    */
//   async transitionToRefunded(
//     actorUserId: string,
//     orderId: string,
//     note?: string,
//   ) {
//     return this.applyTransition({
//       orderId,
//       targetStatus: OrderStatus.REFUNDED,
//       actor: OrderActor.ADMIN,
//       actorUserId,
//       note: note ?? 'Refunded',
//     });
//   }

//   private async applyTransition(input: {
//     orderId: string;
//     targetStatus: OrderStatus;
//     actor: OrderActor;
//     actorUserId?: string;
//     note?: string;
//   }) {
//     return this.em.transactional(async (em) => {
//       const order = await em.findOne(
//         Order,
//         { id: input.orderId },
//         { lockMode: LockMode.PESSIMISTIC_WRITE, populate: ['items'] },
//       );
//       if (!order)
//         throw new NotFoundException(`Không tìm thấy order ${input.orderId}`);

//       const from = order.status;
//       let to: OrderStatus;
//       try {
//         to = transitionOrderStatus(from, input.targetStatus, input.actor);
//       } catch (err) {
//         if (err instanceof InvalidOrderTransitionError) {
//           throw new ConflictException(err.message);
//         }
//         throw err;
//       }

//       await this.applyInventorySideEffects(
//         em,
//         order,
//         from,
//         to,
//         input.actorUserId ?? 'system',
//       );

//       order.status = to;
//       this.stampTimestamp(order, to);

//       em.persist(
//         em.create(OrderStatusHistory, {
//           order,
//           fromStatus: from,
//           toStatus: to,
//           changedByActor: input.actor,
//           changedByUserId: input.actorUserId,
//           note: input.note,
//         }),
//       );

//       await em.flush();
//       await em.populate(order, ['items', 'statusHistory']);

//       // Audit log — best-effort, không throw nếu fail
//       this.auditService.record({
//         action: 'ORDER_STATUS_CHANGE',
//         entityType: 'order',
//         entityId: order.id,
//         actorUserId: input.actorUserId,
//         description: `Order ${order.id.slice(0, 8)}: ${from} → ${to}`,
//         metadata: { from, to, actor: input.actor, note: input.note },
//       });

//       return this.toDto(order);
//     });
//   }

//   // ---------- helpers ----------

//   private async applyInventorySideEffects(
//     em: EntityManager,
//     order: Order,
//     from: OrderStatus,
//     to: OrderStatus,
//     actorUserId: string,
//   ) {
//     const items = order.items.getItems();

//     const movementType = this.resolveMovementType(from, to);
//     if (!movementType) return;

//     for (const it of items) {
//       await this.inventoryService.applyMovementWithinTx(
//         em,
//         {
//           variantId: it.variantId,
//           type: movementType,
//           quantity: it.quantity,
//         },
//         {
//           referenceId: order.id,
//           referenceType: 'ORDER',
//           createdBy: actorUserId,
//           note: `${movementType} for ${from}→${to}`,
//         },
//       );
//     }
//   }

//   private resolveMovementType(
//     from: OrderStatus,
//     to: OrderStatus,
//   ): MovementType | null {
//     if (to === OrderStatus.COMPLETED) return MovementType.SELL;
//     if (to === OrderStatus.CANCELLED) return MovementType.RELEASE;
//     if (to === OrderStatus.REFUNDED) {
//       return from === OrderStatus.COMPLETED
//         ? MovementType.IMPORT
//         : MovementType.RELEASE;
//     }
//     return null;
//   }

//   private stampTimestamp(order: Order, status: OrderStatus) {
//     const now = new Date();
//     if (status === OrderStatus.PAID) order.paidAt = now;
//     if (status === OrderStatus.SHIPPED) order.shippedAt = now;
//     if (status === OrderStatus.COMPLETED) order.completedAt = now;
//     if (status === OrderStatus.CANCELLED) order.cancelledAt = now;
//   }

//   private toDto(order: Order) {
//     return {
//       id: order.id,
//       userId: order.userId,
//       status: order.status,
//       subtotal: order.subtotal,
//       discountAmount: order.discountAmount,
//       voucherCode: order.voucherCode,
//       totalPrice: order.totalPrice,
//       shippingAddress: order.shippingAddress,
//       phone: order.phone,
//       note: order.note,
//       paidAt: order.paidAt,
//       shippedAt: order.shippedAt,
//       completedAt: order.completedAt,
//       cancelledAt: order.cancelledAt,
//       createdAt: order.createdAt,
//       items: order.items.isInitialized()
//         ? order.items.getItems().map((i) => ({
//             id: i.id,
//             variantId: i.variantId,
//             quantity: i.quantity,
//             price: i.price,
//             subtotal: i.subtotal,
//           }))
//         : undefined,
//       timeline: order.statusHistory?.isInitialized()
//         ? order.statusHistory.getItems().map((h) => ({
//             fromStatus: h.fromStatus,
//             toStatus: h.toStatus,
//             actor: h.changedByActor,
//             changedByUserId: h.changedByUserId,
//             note: h.note,
//             at: h.createdAt,
//           }))
//         : undefined,
//     };
//   }
// }

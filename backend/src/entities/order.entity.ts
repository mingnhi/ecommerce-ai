import {
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';
import { OrderStatus } from '@modules/order/enums/order-status.enum';

@Entity({ tableName: 'orders' })
@Index({ properties: ['userId', 'createdAt'] })
@Index({ properties: ['status'] })
export class OrderEntity extends AuditableEntity {
  @Property({ fieldName: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Enum({ items: () => OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus = OrderStatus.PENDING;

  @Property({
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: (value) => Number(value),
    default: '0.00',
  })
  subtotal: number = 0;

  @Property({
    fieldName: 'voucher_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  voucherCode?: string;

  @Property({
    fieldName: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: (value) => Number(value),
    default: '0.00',
  })
  discountAmount: number = 0;

  @Property({
    fieldName: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: (value) => Number(value),
    default: '0.00',
  })
  totalPrice: number = 0;

  @Property({ fieldName: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @Property({ type: 'varchar', length: 20 })
  phone: string;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ fieldName: 'paid_at', type: 'datetime', nullable: true })
  paidAt?: Date;

  @Property({ fieldName: 'shipped_at', type: 'datetime', nullable: true })
  shippedAt?: Date;

  @Property({ fieldName: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date;

  @Property({ fieldName: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt?: Date;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items = new Collection<OrderItemEntity>(this);

  @OneToMany(() => OrderStatusHistoryEntity, (h) => h.order)
  statusHistory = new Collection<OrderStatusHistoryEntity>(this);
}

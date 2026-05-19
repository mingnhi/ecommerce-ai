import {
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { OrderStatus } from '@modules/order/enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity({ tableName: 'orders' })
@Index({ properties: ['userId', 'createdAt'] })
@Index({ properties: ['status', 'createdAt'] })
export class Order extends AuditableEntity {
  @Property({ type: 'string', fieldName: 'user_id' })
  userId: string;

  @Enum({ items: () => OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus = OrderStatus.PENDING;

  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'subtotal', default: '0.00' })
  subtotal: string = '0.00';

  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'discount_amount', default: '0.00' })
  discountAmount: string = '0.00';

  @Property({ type: 'string', length: 50, fieldName: 'voucher_code', nullable: true })
  voucherCode?: string;

  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'total_price' })
  totalPrice: string;

  @Property({ type: 'string', fieldName: 'shipping_address', length: 1000, nullable: true })
  shippingAddress?: string;

  @Property({ type: 'string', length: 20, nullable: true })
  phone?: string;

  @Property({ type: 'string', length: 500, nullable: true })
  note?: string;

  @Property({ type: 'datetime', fieldName: 'paid_at', nullable: true })
  paidAt?: Date;

  @Property({ type: 'datetime', fieldName: 'shipped_at', nullable: true })
  shippedAt?: Date;

  @Property({ type: 'datetime', fieldName: 'completed_at', nullable: true })
  completedAt?: Date;

  @Property({ type: 'datetime', fieldName: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items = new Collection<OrderItem>(this);

  @OneToMany(() => OrderStatusHistory, (h) => h.order)
  statusHistory = new Collection<OrderStatusHistory>(this);
}

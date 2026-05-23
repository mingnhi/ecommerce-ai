import {
  Collection,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { OrderItemEntity } from './order-item.entity';
import { User } from './user.entity';
import { OrderStatus } from '@modules/order/enums/order-status.enum';

@Entity({ tableName: 'orders' })
@Index({ properties: ['userId', 'createdAt'] })
@Index({ properties: ['status'] })
export class OrderEntity extends AuditableEntity {
  @ManyToOne(() => User, {
    fieldName: 'user_id',
    cascade: [],
    updateRule: 'cascade',
    mapToPk: true,
  })
  userId: string;

  @Enum({ items: () => OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus = OrderStatus.PENDING;

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

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items = new Collection<OrderItemEntity>(this);
}

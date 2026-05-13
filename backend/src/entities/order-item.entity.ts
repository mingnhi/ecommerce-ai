import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { Order } from './order.entity';

@Entity({ tableName: 'order_items' })
@Index({ properties: ['variantId'] })
export class OrderItem extends AuditableEntity {
  @ManyToOne(() => Order, { fieldName: 'order_id' })
  order: Order;

  @Property({ type: 'string', fieldName: 'variant_id' })
  variantId: string;

  @Property({ type: 'string', fieldName: 'variant_snapshot', length: 1000, nullable: true })
  variantSnapshot?: string;

  @Property({ type: 'integer' })
  quantity: number;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'subtotal' })
  subtotal: string;
}

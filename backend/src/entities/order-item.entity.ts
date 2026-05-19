import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { OrderEntity } from './order.entity';

@Entity({ tableName: 'order_items' })
export class OrderItemEntity extends AuditableEntity {
  @ManyToOne(() => OrderEntity, { fieldName: 'order_id' })
  order: OrderEntity;

  @Property({ fieldName: 'variant_id', type: 'varchar', length: 36 })
  variantId: string;

  @Property()
  quantity: number;

  @Property({
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: (value) => Number(value),
  })
  price: number;

  @Property({
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: (value) => Number(value),
  })
  subtotal: number;
}

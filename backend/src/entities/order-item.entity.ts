import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { OrderEntity } from './order.entity';
import { ProductVariantEntity } from './product-variant.entity';

@Entity({ tableName: 'order_items' })
export class OrderItemEntity extends AuditableEntity {
  @ManyToOne(() => OrderEntity, { fieldName: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ProductVariantEntity, {
    fieldName: 'variant_id',
    cascade: [],
    updateRule: 'cascade',
    mapToPk: true,
  })
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
}

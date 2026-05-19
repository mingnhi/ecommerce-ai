import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { CartEntity } from './cart.entity';

@Entity({ tableName: 'cart_items' })
export class CartItemEntity extends AuditableEntity {
  @ManyToOne(() => CartEntity, { fieldName: 'cart_id' })
  cart: CartEntity;

  @Property({ fieldName: 'variant_id', type: 'varchar', length: 36 })
  variantId: string;

  @Property()
  quantity: number;

  @Property({
    fieldName: 'price_at_time',
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: (value) => Number(value),
  })
  priceAtTime: number;
}

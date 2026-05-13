import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { Cart } from './cart.entity';

@Entity({ tableName: 'cart_items' })
@Unique({ properties: ['cart', 'variantId'] })
export class CartItem extends AuditableEntity {
  @ManyToOne(() => Cart, { fieldName: 'cart_id' })
  cart: Cart;

  @Property({ type: 'string', fieldName: 'variant_id' })
  variantId: string;

  @Property({ type: 'integer' })
  quantity: number;

  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'price_at_time' })
  priceAtTime: string;
}

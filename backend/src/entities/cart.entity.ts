import { Collection, Entity, Enum, OneToMany, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { CartItemEntity } from './cart-item.entity';
import { CartStatus } from '@modules/cart/enums/cart-status.enum';

@Entity({ tableName: 'carts' })
export class CartEntity extends AuditableEntity {
  @Property({ fieldName: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Enum({ items: () => CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus = CartStatus.ACTIVE;

  @Property({
    fieldName: 'checked_out_at',
    type: 'datetime',
    nullable: true,
  })
  checkedOutAt?: Date;

  @OneToMany(() => CartItemEntity, (item) => item.cart)
  items = new Collection<CartItemEntity>(this);
}

import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { CartItemEntity } from './cart-item.entity';
import { User } from './user.entity';
import { CartStatus } from '@modules/cart/enums/cart-status.enum';

@Entity({ tableName: 'carts' })
export class CartEntity extends AuditableEntity {
  @ManyToOne(() => User, {
    fieldName: 'user_id',
    cascade: [],
    updateRule: 'cascade',
    mapToPk: true,
  })
  userId: string;

  @Enum({ items: () => CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus = CartStatus.ACTIVE;

  @OneToMany(() => CartItemEntity, (item) => item.cart)
  items = new Collection<CartItemEntity>(this);
}

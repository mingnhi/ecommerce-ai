import { Collection, Entity, Enum, Index, OneToMany, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { CartStatus } from '@modules/cart/enums/cart-status.enum';
import { CartItem } from './cart-item.entity';

@Entity({ tableName: 'carts' })
@Index({ properties: ['userId', 'status'] })
export class Cart extends AuditableEntity {
  @Property({ type: 'string', fieldName: 'user_id' })
  userId: string;

  @Enum({ items: () => CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus = CartStatus.ACTIVE;

  @Property({ type: 'datetime', fieldName: 'checked_out_at', nullable: true })
  checkedOutAt?: Date;

  @OneToMany(() => CartItem, (item) => item.cart)
  items = new Collection<CartItem>(this);
}

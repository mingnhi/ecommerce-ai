import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'wishlists' })
@Unique({ properties: ['userId', 'productId'] })
@Index({ properties: ['userId', 'createdAt'] })
export class Wishlist {
  @PrimaryKey({ type: 'string' })
  id: string = uuidv4();

  @Property({ type: 'string', fieldName: 'user_id' })
  userId: string;

  @Property({ type: 'string', fieldName: 'product_id' })
  productId: string;

  @Property({ type: 'datetime', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();
}

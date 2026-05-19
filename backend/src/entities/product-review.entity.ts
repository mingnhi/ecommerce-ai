import {
  Entity,
  ManyToOne,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

import { ProductEntity } from './product.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'product_reviews',
})
export class ProductReviewEntity extends AuditableEntity {
  @ManyToOne(() => ProductEntity, {
    fieldName: 'product_id',
  })
  product: ProductEntity;

  @ManyToOne(() => User, {
    fieldName: 'user_id',
  })
  user: User;

  @Property()
  rating: number;

  @Property({
    type: 'text',
    nullable: true,
  })
  comment?: string;
}
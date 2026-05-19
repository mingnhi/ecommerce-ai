import {
  Entity,
  ManyToOne,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

import { ProductEntity } from './product.entity';
import { Users } from './user.entity';

@Entity({
  tableName: 'product_reviews',
})
export class ProductReviewEntity extends AuditableEntity {
  @ManyToOne(() => ProductEntity, {
    fieldName: 'product_id',
  })
  product: ProductEntity;

  @ManyToOne(() => Users, {
    fieldName: 'user_id',
  })
  user: Users;

  @Property()
  rating: number;

  @Property({
    type: 'text',
    nullable: true,
  })
  comment?: string;
}
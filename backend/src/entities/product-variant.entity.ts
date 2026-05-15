import {
  Entity,
  ManyToOne,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

import { ProductEntity } from './product.entity';

@Entity({
  tableName: 'product_variants',
})
export class ProductVariantEntity extends AuditableEntity {
  @ManyToOne(() => ProductEntity, {
    fieldName: 'product_id',
  })
  product: ProductEntity;

  @Property({
    unique: true,
  })
  sku: string;

  @Property({
    type: 'json',
    nullable: true,
  })
  attributes?: Record<string, any>;

  @Property({
    fieldName: 'is_active',
    default: true,
  })
  isActive: boolean = true;
}
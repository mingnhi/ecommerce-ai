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

  @Property()
  title: string;

  @Property({
    unique: true,
  })
  sku: string;

  @Property({
    default: 0,
  })
  stock: number = 0;

  @Property({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  price?: number;

  @Property({
    nullable: true,
  })
  image?: string;

  @Property({
    fieldName: 'is_active',
    default: true,
  })
  isActive: boolean = true;

  @Property({
    type: 'json',
    nullable: true,
  })
  attributes?: Record<string, any>;
}
import {
  Entity,
  ManyToOne,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

import { ProductEntity } from './product.entity';

@Entity({
  tableName: 'product_prices',
})
export class ProductPriceEntity extends AuditableEntity {
  @ManyToOne(() => ProductEntity, {
    fieldName: 'product_id',
  })
  product: ProductEntity;

  @Property({
    fieldName: 'original_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  originalPrice: number;

  @Property({
    fieldName: 'discount_percent',
    nullable: true,
  })
  discountPercent?: number;

  @Property({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Property({
    default: 'VND',
  })
  currency: string = 'VND';

  @Property({
    fieldName: 'is_active',
    default: true,
  })
  isActive: boolean = true;
}
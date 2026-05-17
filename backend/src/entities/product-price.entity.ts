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
    type: 'decimal',
    precision: 12,
    scale: 2,
    serializer: value =>
      Number(value),
  })
  price: number;

  @Property({
    fieldName: 'original_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    serializer: value =>
      value
        ? Number(value)
        : null,
  })
  originalPrice?: number;

  @Property({
    fieldName: 'discount_percent',
    nullable: true,
  })
  discountPercent?: number;

  @Property({
    length: 10,
    default: 'VND',
  })
  currency: string = 'VND';

  @Property({
    fieldName: 'is_active',
    default: true,
  })
  isActive: boolean = true;

  @Property({
    fieldName: 'start_at',
    nullable: true,
  })
  startAt?: Date;

  @Property({
    fieldName: 'end_at',
    nullable: true,
  })
  endAt?: Date;
}
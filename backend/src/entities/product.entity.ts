import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

import { CategoryEntity } from './category.entity';

import { ProductImageEntity } from './product-image.entity';

import { ProductReviewEntity } from './product-review.entity';

@Entity({
  tableName: 'products',
})
export class ProductEntity extends AuditableEntity {
  @ManyToOne(() => CategoryEntity, {
    fieldName: 'category_id',
  })
  category: CategoryEntity;

  @Property()
  name: string;

  @Property({
    unique: true,
  })
  slug: string;

  @Property({
    fieldName: 'short_description',
    type: 'text',
    nullable: true,
  })
  shortDescription?: string;

  @Property({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Property({
    nullable: true,
  })
  thumbnail?: string;

  /**
   * prices
   */
  @Property({
    type: 'json',
    nullable: true,
  })
  prices?: {
    price: number;

    originalPrice: number;

    discountPercent?: number;

    currency?: string;

    isActive?: boolean;
  }[];

  /**
   * variants
   */
  @Property({
    type: 'json',
    nullable: true,
  })
  variants?: {
    title: string;

    sku: string;

    stock?: number;

    image?: string;

    price?: number;

    isActive?: boolean;

    attributes?: Record<
      string,
      any
    >;
  }[];

  /**
   * attributes
   */
  @Property({
    type: 'json',
    nullable: true,
  })
  attributes?: {
    name: string;

    value: string;
  }[];

  @Property({
    fieldName: 'view_count',
    default: 0,
  })
  viewCount: number = 0;

  @Property({
    fieldName: 'is_active',
    default: true,
  })
  isActive: boolean = true;

  @OneToMany(
    () => ProductImageEntity,
    image => image.product,
  )
  images =
    new Collection<ProductImageEntity>(
      this,
    );

  @OneToMany(
    () => ProductReviewEntity,
    review => review.product,
  )
  reviews =
    new Collection<ProductReviewEntity>(
      this,
    );
}
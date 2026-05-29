import {
  Entity,
  ManyToOne,
  Property,
  Collection,
  OneToMany,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { CategoryEntity } from './category.entity';

import { ProductImageEntity } from './product-image.entity';
import { ProductReviewEntity } from './product-review.entity';
import { ProductAttributeEntity } from './product-attribute.entity';
import { ProductPriceEntity } from './product-price.entity';
import { ProductVariantEntity } from './product-variant.entity';

@Entity({ tableName: 'products' })
export class ProductEntity extends AuditableEntity {
  @ManyToOne(() => CategoryEntity, { fieldName: 'category_id' })
  category: CategoryEntity;

  @Property()
  name: string;

  @Property({ unique: true })
  slug: string;

  @Property({ fieldName: 'short_description', type: 'text', nullable: true })
  shortDescription?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ fieldName: 'seo_title', nullable: true })
  seoTitle?: string;

  @Property({ fieldName: 'seo_description', type: 'text', nullable: true })
  seoDescription?: string;

  @Property({ nullable: true })
 thumbnail?: string | null;

  @Property({ fieldName: 'view_count', default: 0 })
  viewCount: number = 0;

  @Property({ fieldName: 'is_active', default: true })
  isActive: boolean = true;

  // Relations
  @OneToMany(() => ProductAttributeEntity, (attr) => attr.product, { orphanRemoval: true })
  attributes = new Collection<ProductAttributeEntity>(this);

  @OneToMany(() => ProductPriceEntity, (price) => price.product, { orphanRemoval: true })
  prices = new Collection<ProductPriceEntity>(this);

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product, { orphanRemoval: true })
  variants = new Collection<ProductVariantEntity>(this);

  @OneToMany(() => ProductImageEntity, (image) => image.product, { orphanRemoval: true })
  images = new Collection<ProductImageEntity>(this);

  @OneToMany(() => ProductReviewEntity, (review) => review.product)
  reviews = new Collection<ProductReviewEntity>(this);
}
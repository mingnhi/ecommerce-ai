import {
  Entity,
  Enum,
  ManyToOne,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

import { ProductEntity } from './product.entity';

export enum ProductImageType {
  THUMBNAIL = 'THUMBNAIL',
  GALLERY = 'GALLERY',
  ZOOM = 'ZOOM',
}

@Entity({
  tableName: 'product_images',
})
export class ProductImageEntity extends AuditableEntity {
  @ManyToOne(() => ProductEntity, {
    fieldName: 'product_id',
  })
  product: ProductEntity;

  @Property({
    fieldName: 'image_url',
  })
  imageUrl: string;

  @Enum({
    items: () => ProductImageType,
    default: ProductImageType.GALLERY,
  })
  type: ProductImageType =
    ProductImageType.GALLERY;

  @Property({
    fieldName: 'sort_order',
    default: 0,
  })
  sortOrder: number = 0;

  @Property({
    fieldName: 'is_primary',
    default: false,
  })
  isPrimary: boolean = false;
}
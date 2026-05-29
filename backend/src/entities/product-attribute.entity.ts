import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { ProductEntity } from './product.entity';

@Entity({ tableName: 'product_attributes' })
export class ProductAttributeEntity extends AuditableEntity {
  @ManyToOne(() => ProductEntity, { fieldName: 'product_id' })
  product: ProductEntity;

  @Property()
  name: string;

  @Property()
  value: string;
}
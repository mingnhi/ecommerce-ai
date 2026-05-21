import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { ProductVariantEntity } from './product-variant.entity';

@Entity({ tableName: 'inventories' })
export class InventoryEntity extends AuditableEntity {
  @ManyToOne(() => ProductVariantEntity, {
    fieldName: 'variant_id',
    unique: true,
    cascade: [],
    deleteRule: 'cascade',
    updateRule: 'cascade',
    mapToPk: true,
  })
  variantId: string;

  @Property({ default: 0 })
  available: number = 0;

  @Property({ default: 0 })
  reserved: number = 0;

  @Property({ default: 0 })
  sold: number = 0;
}

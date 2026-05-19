import { Entity, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

@Entity({ tableName: 'inventories' })
export class InventoryEntity extends AuditableEntity {
  @Property({
    fieldName: 'variant_id',
    type: 'varchar',
    length: 36,
    unique: true,
  })
  variantId: string;

  @Property({
    fieldName: 'warehouse_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  warehouseId?: string;

  @Property({ default: 0 })
  available: number = 0;

  @Property({ default: 0 })
  reserved: number = 0;

  @Property({ default: 0 })
  sold: number = 0;

  @Property({ fieldName: 'low_stock_threshold', default: 10 })
  lowStockThreshold: number = 10;
}

import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';

@Entity({ tableName: 'inventories' })
@Unique({ properties: ['variantId', 'warehouseId'] })
export class Inventory extends AuditableEntity {
  @Property({ type: 'string', fieldName: 'variant_id' })
  variantId: string;

  @Property({ type: 'string', fieldName: 'warehouse_id', nullable: true })
  warehouseId?: string;

  @Index()
  @Property({ type: 'integer', default: 0 })
  available: number = 0;

  @Property({ type: 'integer', default: 0 })
  reserved: number = 0;

  @Property({ type: 'integer', default: 0 })
  sold: number = 0;

  @Property({ type: 'integer', fieldName: 'low_stock_threshold', default: 10 })
  lowStockThreshold: number = 10;
}

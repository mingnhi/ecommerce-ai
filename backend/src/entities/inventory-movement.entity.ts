import { Entity, Enum, Index, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { MovementType } from '@modules/inventory/enums/movement-type.enum';

@Entity({ tableName: 'inventory_movements' })
@Index({ properties: ['variantId', 'createdAt'] })
export class InventoryMovementEntity extends AuditableEntity {
  @Property({ fieldName: 'variant_id', type: 'varchar', length: 36 })
  variantId: string;

  @Property({
    fieldName: 'warehouse_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  warehouseId?: string;

  @Enum({ items: () => MovementType })
  type: MovementType;

  @Property()
  quantity: number;

  @Property({
    fieldName: 'reference_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  referenceId?: string;

  @Property({
    fieldName: 'reference_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  referenceType?: string;

  @Property({
    fieldName: 'created_by',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  createdBy?: string;

  @Property({ type: 'text', nullable: true })
  note?: string;
}

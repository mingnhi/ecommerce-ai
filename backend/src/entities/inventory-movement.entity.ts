import { Entity, Enum, Index, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { MovementType } from '@modules/inventory/enums/movement-type.enum';

@Entity({ tableName: 'inventory_movements' })
@Index({ properties: ['variantId', 'createdAt'] })
@Index({ properties: ['referenceId', 'type'] })
export class InventoryMovement {
  @Property({ type: 'string', primary: true })
  id: string = uuidv4();

  @Property({ type: 'string', fieldName: 'variant_id' })
  variantId: string;

  @Property({ type: 'string', fieldName: 'warehouse_id', nullable: true })
  warehouseId?: string;

  @Enum({ items: () => MovementType })
  type: MovementType;

  @Property({ type: 'integer' })
  quantity: number;

  @Property({ type: 'string', fieldName: 'reference_id', nullable: true })
  referenceId?: string;

  @Property({ type: 'string', fieldName: 'reference_type', nullable: true })
  referenceType?: string;

  @Property({ type: 'string', fieldName: 'created_by', nullable: true })
  createdBy?: string;

  @Property({ type: 'string', length: 500, nullable: true })
  note?: string;

  @Property({ type: 'datetime', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();
}

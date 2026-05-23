import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { ProductVariantEntity } from './product-variant.entity';
import { MovementType } from '@modules/inventory/enums/movement-type.enum';

@Entity({ tableName: 'inventory_movements' })
@Index({ properties: ['variantId', 'createdAt'] })
export class InventoryMovementEntity extends AuditableEntity {
  @ManyToOne(() => ProductVariantEntity, {
    fieldName: 'variant_id',
    cascade: [],
    updateRule: 'cascade',
    mapToPk: true,
  })
  variantId: string;

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

  @Property({ type: 'text', nullable: true })
  note?: string;
}

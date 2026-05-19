import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';
import { OrderEntity } from './order.entity';
import { OrderStatus } from '@modules/order/enums/order-status.enum';
import { OrderActor } from '@modules/order/enums/order-actor.enum';

@Entity({ tableName: 'order_status_history' })
export class OrderStatusHistoryEntity extends AuditableEntity {
  @ManyToOne(() => OrderEntity, { fieldName: 'order_id' })
  order: OrderEntity;

  @Enum({ items: () => OrderStatus, fieldName: 'from_status', nullable: true })
  fromStatus?: OrderStatus;

  @Enum({ items: () => OrderStatus, fieldName: 'to_status' })
  toStatus: OrderStatus;

  @Enum({ items: () => OrderActor, fieldName: 'changed_by_actor' })
  changedByActor: OrderActor;

  @Property({
    fieldName: 'changed_by_user_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  changedByUserId?: string;

  @Property({ type: 'text', nullable: true })
  note?: string;
}

import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { OrderStatus } from '@modules/order/enums/order-status.enum';
import { OrderActor } from '@modules/order/domain/order-status-transition';
import { Order } from './order.entity';

/**
 * Immutable audit log — mỗi transition của Order ghi 1 dòng.
 * Phục vụ S5-02 timeline + audit cho S5-03.
 */
@Entity({ tableName: 'order_status_history' })
export class OrderStatusHistory {
  @Property({ type: 'string', primary: true })
  id: string = uuidv4();

  @ManyToOne(() => Order, { fieldName: 'order_id' })
  order: Order;

  @Enum({ items: () => OrderStatus, fieldName: 'from_status', nullable: true })
  fromStatus?: OrderStatus;

  @Enum({ items: () => OrderStatus, fieldName: 'to_status' })
  toStatus: OrderStatus;

  @Enum({ items: () => OrderActor, fieldName: 'changed_by_actor' })
  changedByActor: OrderActor;

  @Property({ type: 'string', fieldName: 'changed_by_user_id', nullable: true })
  changedByUserId?: string;

  @Property({ type: 'string', length: 500, nullable: true })
  note?: string;

  @Property({ type: 'datetime', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();
}

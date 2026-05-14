import { Entity, Index, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';

@Entity({ tableName: 'audit_logs' })
@Index({ properties: ['actorUserId', 'createdAt'] })
@Index({ properties: ['entityType', 'entityId'] })
@Index({ properties: ['action'] })
export class AuditLog extends AuditableEntity {
  /** Hành động ngắn: LOGIN, ORDER_STATUS_CHANGE, REFUND, USER_BAN, ... */
  @Property({ type: 'string', length: 100 })
  action: string;

  /** Tên entity: user, order, product, voucher... */
  @Property({ type: 'string', length: 50, fieldName: 'entity_type', nullable: true })
  entityType?: string;

  /** ID của entity bị tác động. */
  @Property({ type: 'string', length: 255, fieldName: 'entity_id', nullable: true })
  entityId?: string;

  /** UserId của người thực hiện (admin/customer). null = SYSTEM action. */
  @Property({ type: 'string', length: 255, fieldName: 'actor_user_id', nullable: true })
  actorUserId?: string;

  /** Trace id của request — link sang Pino log để debug. */
  @Property({ type: 'string', length: 255, fieldName: 'trace_id', nullable: true })
  traceId?: string;

  /** IP của actor (có thể là spoofed nếu sau proxy). */
  @Property({ type: 'string', length: 45, fieldName: 'ip_address', nullable: true })
  ipAddress?: string;

  /** Mô tả ngắn để admin đọc nhanh: "Đổi status order #abc từ PENDING → PAID" */
  @Property({ type: 'string', length: 500, nullable: true })
  description?: string;

  /** Metadata JSON tự do: before/after state, lý do, etc. */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;
}

import { Global, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { AuditLog } from '@entities/audit-log.entity';

export interface RecordAuditInput {
  action: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  traceId?: string;
  ipAddress?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(AuditLog)
    private readonly repo: EntityRepository<AuditLog>,
  ) {}

  /**
   * Ghi audit log. Best-effort: nếu fail KHÔNG throw (audit không được làm gãy business action).
   * Caller có thể gọi và quên — service tự catch + log warning.
   */
  async record(input: RecordAuditInput): Promise<void> {
    try {
      // Tạo trên fork để không ảnh hưởng tx hiện tại
      const fork = this.em.fork();
      const log = fork.create(AuditLog, {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorUserId: input.actorUserId,
        traceId: input.traceId,
        ipAddress: input.ipAddress,
        description: input.description,
        metadata: input.metadata,
      });
      await fork.persistAndFlush(log);
    } catch (err) {
      this.logger.warn(
        `Failed to record audit log [${input.action}]: ${(err as Error)?.message}`,
      );
    }
  }

  async list(params: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);

    const where: FilterQuery<AuditLog> = {};
    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.actorUserId) where.actorUserId = params.actorUserId;

    const [items, total] = await this.repo.findAndCount(where, {
      orderBy: { createdAt: QueryOrder.DESC },
      limit,
      offset: (page - 1) * limit,
    });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

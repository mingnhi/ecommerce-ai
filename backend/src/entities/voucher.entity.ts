import { Entity, Enum, Index, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';

export enum VoucherDiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

@Entity({ tableName: 'vouchers' })
@Index({ properties: ['code'] })
export class Voucher extends AuditableEntity {
  @Property({ type: 'string', length: 50, unique: true })
  code: string;

  @Property({ type: 'string', length: 200, nullable: true })
  description?: string;

  @Enum({ items: () => VoucherDiscountType, fieldName: 'discount_type' })
  discountType: VoucherDiscountType;

  /** PERCENT: 1-100 (vd 10 = 10%). FIXED: VND amount (vd "50000.00"). */
  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'discount_value' })
  discountValue: string;

  /** Đơn tối thiểu để dùng (VND). 0 = không yêu cầu. */
  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'min_order_amount', default: '0.00' })
  minOrderAmount: string = '0.00';

  /** Trần giảm cho PERCENT (vd 10% nhưng cap 100k). null = không cap. */
  @Property({ type: 'decimal', precision: 12, scale: 2, fieldName: 'max_discount', nullable: true })
  maxDiscount?: string;

  @Property({ type: 'datetime', fieldName: 'valid_from', nullable: true })
  validFrom?: Date;

  @Property({ type: 'datetime', fieldName: 'valid_until', nullable: true })
  validUntil?: Date;

  /** Tổng lượt sử dụng tối đa. null = không giới hạn. */
  @Property({ type: 'integer', fieldName: 'usage_limit', nullable: true })
  usageLimit?: number;

  @Property({ type: 'integer', fieldName: 'usage_count', default: 0 })
  usageCount: number = 0;

  @Property({ type: 'boolean', fieldName: 'is_active', default: true })
  isActive: boolean = true;
}

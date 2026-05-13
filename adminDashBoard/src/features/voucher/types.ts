export type VoucherDiscountType = 'PERCENT' | 'FIXED';

export interface Voucher {
  id: string;
  code: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscount?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateVoucherInput {
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: string;
  minOrderAmount?: string;
  maxDiscount?: string;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  isActive?: boolean;
}

export type UpdateVoucherInput = Partial<Omit<CreateVoucherInput, 'code'>>;

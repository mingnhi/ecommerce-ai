export type VoucherDiscountType = "PERCENT" | "FIXED";

export type Voucher = {
  id: string;
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: string | number;
  maxDiscount?: string | number | null;
  minOrderAmount: string | number;
  validUntil?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
};

export type VoucherListQuery = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
};

export type VoucherListResult = {
  items: Voucher[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type VoucherFormValues = {
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil?: string;
  usageLimit?: number;
  isActive: boolean;
};

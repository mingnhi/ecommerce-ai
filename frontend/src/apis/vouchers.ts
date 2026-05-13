import { request } from './axios';

export type VoucherDiscountType = 'PERCENT' | 'FIXED';

export interface VoucherPreview {
  voucherId: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: string;
  discountAmount: string;
}

export const vouchersApi = {
  /** Preview discount cho subtotal hiện tại — KHÔNG consume usage. */
  preview: (code: string, subtotal: string) =>
    request.post<VoucherPreview>('/vouchers/apply', { code, subtotal }),
};

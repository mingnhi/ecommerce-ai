import { httpClient } from "./http";
import type {
  Voucher,
  VoucherFormValues,
  VoucherListQuery,
  VoucherListResult,
} from "@/features/voucher/types/voucher.type";

type ApiVoucher = {
  id?: string;
  code?: string;
  description?: string;
  discountType?: "PERCENT" | "FIXED";
  discountValue?: string | number;
  maxDiscount?: string | number | null;
  minOrderAmount?: string | number;
  validUntil?: string | null;
  usageLimit?: number | null;
  usageCount?: number;
  isActive?: boolean;
};

const normalizeVoucher = (item: ApiVoucher): Voucher => ({
  id: String(item.id),
  code: item.code ?? "",
  description: item.description,
  discountType: item.discountType ?? "PERCENT",
  discountValue: item.discountValue ?? 0,
  maxDiscount: item.maxDiscount,
  minOrderAmount: item.minOrderAmount ?? 0,
  validUntil: item.validUntil,
  usageLimit: item.usageLimit,
  usageCount: item.usageCount ?? 0,
  isActive: Boolean(item.isActive),
});

export const fetchVouchers = async (
  query: VoucherListQuery = {},
): Promise<VoucherListResult> => {
  const res = await httpClient.get("/admin/vouchers", { params: query });
  const payload = res.data?.data ?? res.data;
  const items = (payload?.items ?? []).map((item: ApiVoucher) => normalizeVoucher(item));
  const meta = payload?.meta ?? {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    total: items.length,
    totalPages: 1,
  };

  return { items, meta };
};

export const createVoucher = async (payload: VoucherFormValues) => {
  const res = await httpClient.post("/admin/vouchers", payload);
  return res.data;
};

export const updateVoucher = async (id: string, payload: Partial<VoucherFormValues>) => {
  const res = await httpClient.patch(`/admin/vouchers/${id}`, payload);
  return res.data;
};

export const deleteVoucher = async (id: string) => {
  await httpClient.delete(`/admin/vouchers/${id}`);
};

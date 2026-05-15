import { httpClient } from '@/services/http';
import type {
  CreateVoucherInput,
  UpdateVoucherInput,
  Voucher,
} from './types';

interface ListResponse {
  items: Voucher[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const voucherApi = {
  list: async (params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ListResponse> => {
    const res = await httpClient.get<ListResponse>('/admin/vouchers', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Voucher> => {
    const res = await httpClient.get<Voucher>(`/admin/vouchers/${id}`);
    return res.data;
  },
  create: async (input: CreateVoucherInput): Promise<Voucher> => {
    const res = await httpClient.post<Voucher>('/admin/vouchers', input);
    return res.data;
  },
  update: async (id: string, input: UpdateVoucherInput): Promise<Voucher> => {
    const res = await httpClient.patch<Voucher>(`/admin/vouchers/${id}`, input);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/admin/vouchers/${id}`);
  },
};

import { request } from '@/apis/axios';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district: string;
  province: string;
  isDefault?: boolean;
}

type AddressResponse<T> = { status?: string; message?: string; data?: T };

export const addressesApi = {
  list: async (): Promise<Address[]> => {
    const res = await request.get<AddressResponse<Address[]>>('/addresses');
    return res.data ?? [];
  },
  create: async (input: AddressInput): Promise<Address> => {
    const res = await request.post<AddressResponse<Address>>('/addresses', input);
    if (!res.data) throw new Error('Empty response');
    return res.data;
  },
  update: async (id: string, input: Partial<AddressInput>): Promise<Address> => {
    const res = await request.patch<AddressResponse<Address>>(`/addresses/${id}`, input);
    if (!res.data) throw new Error('Empty response');
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await request.delete(`/addresses/${id}`);
  },
  setDefault: async (id: string): Promise<Address> => {
    const res = await request.post<AddressResponse<Address>>(`/addresses/${id}/default`);
    if (!res.data) throw new Error('Empty response');
    return res.data;
  },
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voucherApi } from './api';
import type { CreateVoucherInput, UpdateVoucherInput } from './types';

const KEY = ['vouchers'] as const;

export const useVouchers = (params: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}) =>
  useQuery({
    queryKey: [...KEY, params],
    queryFn: () => voucherApi.list(params),
    staleTime: 30_000,
  });

export const useCreateVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVoucherInput) => voucherApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVoucherInput }) =>
      voucherApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voucherApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

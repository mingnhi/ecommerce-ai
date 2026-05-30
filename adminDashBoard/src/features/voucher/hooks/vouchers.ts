import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVoucher,
  deleteVoucher,
  fetchVouchers,
  updateVoucher,
} from "@/services/voucher";
import type {
  VoucherFormValues,
  VoucherListQuery,
} from "../types/voucher.type";

const VOUCHERS_KEY = ["vouchers"] as const;

export function useVouchers(query: VoucherListQuery = {}) {
  return useQuery({
    queryKey: [...VOUCHERS_KEY, query],
    queryFn: () => fetchVouchers(query),
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VoucherFormValues> }) =>
      updateVoucher(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
    },
  });
}

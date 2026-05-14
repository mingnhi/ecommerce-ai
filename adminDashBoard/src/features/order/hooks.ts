import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "./api";
import type { OrderStatus } from "./types";

const KEY = ["orders"] as const;

export const useOrders = (params: { status?: OrderStatus; userId?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...KEY, params],
    queryFn: () => orderApi.list(params),
    placeholderData: (prev) => prev,
  });

export const useOrder = (id?: string) =>
  useQuery({
    queryKey: [...KEY, "detail", id],
    queryFn: () => orderApi.getById(id!),
    enabled: !!id,
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      orderApi.updateStatus(id, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useBulkUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderIds,
      status,
      note,
    }: {
      orderIds: string[];
      status: OrderStatus;
      note?: string;
    }) => orderApi.bulkUpdateStatus(orderIds, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

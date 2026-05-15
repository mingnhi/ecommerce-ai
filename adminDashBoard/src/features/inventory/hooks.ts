import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "./api";
import type { MovementType } from "./types";

const KEY = ["inventory"] as const;

export const useInventoryList = (params: { low_stock?: boolean; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...KEY, params],
    queryFn: () => inventoryApi.list(params),
    placeholderData: (prev) => prev,
  });

export const useCreateMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      variantId: string;
      type: MovementType;
      quantity: number;
      note?: string;
    }) => inventoryApi.createMovement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useMovements = (params: { variantId?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ["movements", params],
    queryFn: () => inventoryApi.listMovements(params),
    placeholderData: (prev) => prev,
  });

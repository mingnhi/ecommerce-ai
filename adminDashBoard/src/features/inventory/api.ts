import { httpClient } from "@/services/http";
import type {
  InventoryListResponse,
  InventoryRow,
  Movement,
  MovementType,
  MovementsListResponse,
} from "./types";

export const inventoryApi = {
  list: async (params: { low_stock?: boolean; page?: number; limit?: number }): Promise<InventoryListResponse> => {
    const res = await httpClient.get<InventoryListResponse>("/inventory", { params });
    return res.data;
  },
  getByVariantId: async (variantId: string): Promise<InventoryRow> => {
    const res = await httpClient.get<InventoryRow>(`/inventory/${variantId}`);
    return res.data;
  },
  setAbsolute: async (variantId: string, quantity: number, note?: string): Promise<{ inventory: InventoryRow; movement: Movement }> => {
    const res = await httpClient.put(`/inventory/${variantId}`, { quantity, note });
    return res.data;
  },
  createMovement: async (data: {
    variantId: string;
    type: MovementType;
    quantity: number;
    note?: string;
    referenceId?: string;
    referenceType?: string;
  }) => {
    const res = await httpClient.post<{ inventory: InventoryRow; movement: Movement }>(
      "/inventory/movements",
      data,
    );
    return res.data;
  },
  listMovements: async (params: { variantId?: string; type?: MovementType; page?: number; limit?: number }): Promise<MovementsListResponse> => {
    const res = await httpClient.get<MovementsListResponse>("/inventory/movements", { params });
    return res.data;
  },
};

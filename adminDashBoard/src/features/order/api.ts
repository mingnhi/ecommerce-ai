import { httpClient } from "@/services/http";
import type { Order, OrderStatus, OrdersListResponse } from "./types";

export const orderApi = {
  list: async (params: { status?: OrderStatus; userId?: string; page?: number; limit?: number }): Promise<OrdersListResponse> => {
    const res = await httpClient.get<OrdersListResponse>("/orders", { params });
    return res.data;
  },
  getById: async (id: string): Promise<Order> => {
    const res = await httpClient.get<Order>(`/orders/${id}`);
    return res.data;
  },
  updateStatus: async (id: string, status: OrderStatus, note?: string): Promise<Order> => {
    const res = await httpClient.put<Order>(`/orders/${id}/status`, { status, note });
    return res.data;
  },

  bulkUpdateStatus: async (
    orderIds: string[],
    status: OrderStatus,
    note?: string,
  ): Promise<{
    total: number;
    succeededCount: number;
    failedCount: number;
    succeeded: string[];
    failed: Array<{ orderId: string; reason: string }>;
  }> => {
    const res = await httpClient.post<{
      total: number;
      succeededCount: number;
      failedCount: number;
      succeeded: string[];
      failed: Array<{ orderId: string; reason: string }>;
    }>('/orders/bulk-status', { orderIds, status, note });
    return res.data;
  },
};

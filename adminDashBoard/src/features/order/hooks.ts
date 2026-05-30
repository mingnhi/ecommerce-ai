import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus } from "./types";
import { toApiStatus } from "./lib";
import {
  deleteOrder,
  fetchOrder,
  fetchOrders,
  updateOrderStatus,
  type OrderListQuery,
} from "@/services/orders";

const ORDERS_KEY = ["orders"] as const;
const ordersListKey = (query: OrderListQuery) => [...ORDERS_KEY, query] as const;
const orderDetailKey = (id: string) => [...ORDERS_KEY, id] as const;

export function useOrders(query: OrderListQuery) {
  return useQuery({
    queryKey: ordersListKey(query),
    queryFn: () => fetchOrders(query),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderDetailKey(id),
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => {
      const apiStatus = toApiStatus(status);
      if (!apiStatus) {
        throw new Error("Invalid order status");
      }
      return updateOrderStatus(id, apiStatus);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}

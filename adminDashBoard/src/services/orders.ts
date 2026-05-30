import { httpClient } from "./http";
import { unwrapApiData } from "./api";

export type ApiOrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type ApiOrderItem = {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  thumbnail?: string;
};

export type ApiOrder = {
  id: string;
  userId: string;
  status: ApiOrderStatus;
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  items?: ApiOrderItem[];
};

export type OrderListQuery = {
  page?: number;
  limit?: number;
  status?: ApiOrderStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
};

export type OrderListResult = {
  items: ApiOrder[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

type OrderListResponse = {
  data?: ApiOrder[];
  meta?: {
    pagination?: OrderListResult["pagination"];
  };
};

export const fetchOrders = async (
  query: OrderListQuery = {},
): Promise<OrderListResult> => {
  const res = await httpClient.get<OrderListResponse>("/orders", { params: query });
  const items = unwrapApiData<ApiOrder[]>(res.data);
  const pagination = res.data.meta?.pagination ?? {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    totalItems: items.length,
    totalPages: 1,
  };

  return { items, pagination };
};

export const fetchOrder = async (id: string): Promise<ApiOrder> => {
  const res = await httpClient.get(`/orders/${id}`);
  return unwrapApiData<ApiOrder>(res.data);
};

export const updateOrderStatus = async (
  id: string,
  status: ApiOrderStatus,
): Promise<ApiOrder> => {
  const res = await httpClient.patch(`/orders/${id}/status`, { status });
  return unwrapApiData<ApiOrder>(res.data);
};

export const deleteOrder = async (id: string): Promise<void> => {
  await httpClient.delete(`/orders/${id}`);
};

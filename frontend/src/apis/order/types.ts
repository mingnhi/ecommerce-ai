import type { ApiEnvelope } from '@/types/common';
import { IOrderListParams } from '@/types/order';

export type ApiOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

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

export type OrderListRequest = {
  page?: number;
  limit?: number;
  status?: ApiOrderStatus;
};

export type OrderListPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type OrderListResult = {
  items: ApiOrder[];
  pagination?: OrderListPagination;
};

export type OrderListResponse = ApiEnvelope<ApiOrder[]> & {
  meta?: {
    pagination?: OrderListPagination;
  };
};

export type CreateOrderPayload = {
  shippingAddress: string;
  phone: string;
  note?: string;
  cartItemIds: string[];
};

export type CreatedOrder = {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateOrderResponse = ApiEnvelope<CreatedOrder>;

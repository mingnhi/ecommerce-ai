import { request } from './axios';
import type { PaginationMeta } from './products';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface OrderTimelineEntry {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actor: 'USER' | 'ADMIN' | 'SYSTEM';
  note?: string | null;
  at: string;
}

export interface CustomerOrder {
  id: string;
  status: OrderStatus;
  subtotal?: string;
  discountAmount?: string;
  voucherCode?: string | null;
  totalPrice: string;
  shippingAddress?: string | null;
  phone?: string | null;
  note?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  items?: OrderItem[];
  timeline?: OrderTimelineEntry[];
}

export const ordersApi = {
  create: (data: { shippingAddress: string; phone: string; note?: string; voucherCode?: string }) =>
    request.post<CustomerOrder>('/orders', data),

  list: (params: { status?: OrderStatus; page?: number; limit?: number }) =>
    request.get<{ items: CustomerOrder[]; meta: PaginationMeta }>('/orders', { params }),

  getById: (id: string) => request.get<CustomerOrder>(`/orders/${id}`),

  cancel: (id: string, note?: string) =>
    request.post<CustomerOrder>(`/orders/${id}/cancel`, note ? { note } : {}),
};

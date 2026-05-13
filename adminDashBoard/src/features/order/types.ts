import type { PaginationMeta } from "@/features/user/types";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

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
  actor: "USER" | "ADMIN" | "SYSTEM";
  changedByUserId?: string | null;
  note?: string | null;
  at: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
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

export interface OrdersListResponse {
  items: Order[];
  meta: PaginationMeta;
}

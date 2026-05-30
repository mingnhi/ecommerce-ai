import type { ApiOrder, ApiOrderStatus } from "@/services/orders";
import type { User } from "@/features/users/types";
import {
  ORDER_STATUSES,
  type IAdminOrder,
  type OrdersTableRow,
  type OrderStatus,
} from "@/features/order/types";

export type OrderListFilters = {
  search: string;
  status: OrderStatus | "all";
  dateFrom: string;
  dateTo: string;
};

const UI_TO_API: Record<OrderStatus, ApiOrderStatus> = {
  pending: "PENDING",
  confirmed: "PAID",
  shipping: "SHIPPED",
  delivered: "COMPLETED",
  cancelled: "CANCELLED",
};

const API_TO_UI: Record<ApiOrderStatus, OrderStatus> = {
  PENDING: "pending",
  PAID: "confirmed",
  SHIPPED: "shipping",
  COMPLETED: "delivered",
  CANCELLED: "cancelled",
};

export function toApiStatus(status: OrderStatus | "all"): ApiOrderStatus | undefined {
  if (status === "all") return undefined;
  return UI_TO_API[status];
}

export function toUiStatus(status: ApiOrderStatus): OrderStatus {
  return API_TO_UI[status];
}

export function getSelectableStatuses(): OrderStatus[] {
  return ORDER_STATUSES;
}

export function buildOrderQuery(filters: OrderListFilters) {
  return {
    page: 1,
    limit: 100,
    status: toApiStatus(filters.status),
    startDate: filters.dateFrom || undefined,
    endDate: filters.dateTo || undefined,
  };
}

export function formatOrderNumber(id: string) {
  return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function toAdminOrder(order: ApiOrder, user?: User): IAdminOrder {
  const products = (order.items ?? []).map((item) => ({
    id: item.id,
    productId: item.variantId,
    name: item.productName,
    image: item.thumbnail,
    price: item.price,
    quantity: item.quantity,
  }));

  const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = order.totalPrice;
  const discount = Math.max(0, subtotal - total);

  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    status: toUiStatus(order.status),
    products,
    subtotal,
    shippingFee: 0,
    discount,
    total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveredAt: order.status === "COMPLETED" ? order.updatedAt : undefined,
    customerId: order.userId,
    customerName: user?.fullName ?? "Khách hàng",
    customerEmail: user?.email ?? "—",
  };
}

export function filterOrders(orders: IAdminOrder[], f: OrderListFilters): IAdminOrder[] {
  const q = f.search.trim().toLowerCase();
  return orders.filter((o) => {
    if (q) {
      const name = o.customerName.toLowerCase();
      const num = o.orderNumber.toLowerCase();
      if (!name.includes(q) && !num.includes(q)) return false;
    }
    return true;
  });
}

export function groupOrdersByCustomer(orders: IAdminOrder[]): OrdersTableRow[] {
  const map = new Map<string, IAdminOrder[]>();
  for (const o of orders) {
    const list = map.get(o.customerId) ?? [];
    list.push(o);
    map.set(o.customerId, list);
  }
  return Array.from(map.entries()).map(([customerId, list]) => {
    const head = list[0]!;
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return {
      rowType: "customer" as const,
      id: `customer-${customerId}`,
      customerId,
      name: head.customerName,
      email: head.customerEmail,
      avatar: head.customerAvatar,
      subRows: sorted.map((o) => ({ rowType: "order" as const, ...o })),
    };
  });
}

export function isOrderRow(row: OrdersTableRow): row is { rowType: "order" } & IAdminOrder {
  return row.rowType === "order";
}

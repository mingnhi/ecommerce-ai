import type { ApiOrder, ApiOrderStatus } from '@/apis/order/types';
import type { IOrder, OrderStatus } from '@/types/order';

const UI_STATUS: Record<ApiOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  PAID: 'confirmed',
  SHIPPED: 'shipping',
  COMPLETED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_TAB_STATUS: Record<string, ApiOrderStatus | undefined> = {
  all: undefined,
  pending: 'PENDING',
  confirmed: 'PAID',
  shipping: 'SHIPPED',
  delivered: 'COMPLETED',
  cancelled: 'CANCELLED',
};

export function mapApiOrder(order: ApiOrder): IOrder {
  const createdAt =
    typeof order.createdAt === 'string'
      ? order.createdAt
      : new Date(order.createdAt).toISOString();
  const updatedAt =
    typeof order.updatedAt === 'string'
      ? order.updatedAt
      : new Date(order.updatedAt).toISOString();

  return {
    id: order.id,
    orderNumber: order.id.slice(0, 8).toUpperCase(),
    status: UI_STATUS[order.status] ?? 'pending',
    products: (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.variantId,
      name: item.productName,
      image: item.thumbnail,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal: order.totalPrice,
    shippingFee: 0,
    discount: 0,
    total: order.totalPrice,
    createdAt,
    updatedAt,
  };
}

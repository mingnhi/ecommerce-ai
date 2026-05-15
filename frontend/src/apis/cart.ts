import { request } from './axios';

export interface ServerCartItem {
  id: string;
  variantId: string;
  quantity: number;
  priceAtTime: string;
  subtotal: string;
}

export interface ServerCart {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';
  items: ServerCartItem[];
  total: string;
  itemCount: number;
}

export const cartApi = {
  get: () => request.get<ServerCart>('/cart'),

  addItem: (variantId: string, quantity: number) =>
    request.post<ServerCart>('/cart/items', { variantId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    request.put<{ id: string; quantity: number }>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    request.delete<{ success: boolean }>(`/cart/items/${itemId}`),

  merge: (items: { variantId: string; quantity: number }[]) =>
    request.post<ServerCart>('/cart/merge', { items }),
};

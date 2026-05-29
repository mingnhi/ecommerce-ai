import { request } from '../axios';
import { KEYS } from './keys';
import type {
  AddCartItemRequest,
  CartResponse,
  MergeCartRequest,
  UpdateCartItemRequest,
} from './types';

export const CartService = {
  getCart: () => request.get<CartResponse>(KEYS.CART),

  addItem: (data: AddCartItemRequest) =>
    request.post<CartResponse>(KEYS.CART_ITEMS, data),

  updateItem: (id: string, data: UpdateCartItemRequest) =>
    request.patch<CartResponse>(`${KEYS.CART_ITEMS}/${id}`, data),

  removeItem: (id: string) =>
    request.delete<CartResponse>(`${KEYS.CART_ITEMS}/${id}`),

  merge: (data: MergeCartRequest) =>
    request.post<CartResponse>(KEYS.CART_MERGE, data),
};

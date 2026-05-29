import type { ApiEnvelope } from '@/types/common';

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  priceAtTime: number;
  subtotal: number;
  productName: string;
  variantLabel?: string;
  thumbnail: string | null;
}

export interface Cart {
  id: string;
  userId: string;
  status: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AddCartItemRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface GuestCartLineRequest {
  variantId: string;
  quantity: number;
}

export interface MergeCartRequest {
  items: GuestCartLineRequest[];
}

export type CartResponse = ApiEnvelope<Cart>;

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
  productName: string;
  variantLabel?: string;
  unitPrice: number;
  thumbnail?: string;
}

export interface CartItemMeta {
  productName?: string;
  variantLabel?: string;
  thumbnail?: string;
}

export interface GuestCartLine extends CartItemMeta {
  variantId: string;
  quantity: number;
  unitPriceVnd?: string;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
}

export type CartLineInput = Omit<CartLine, 'id'>;

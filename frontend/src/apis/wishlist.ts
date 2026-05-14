import { request } from './axios';

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  thumbnail?: string;
  currentPrice: string | null;
  createdAt: string;
}

export const wishlistApi = {
  list: () => request.get<WishlistItem[]>('/wishlist'),
  listIds: () => request.get<string[]>('/wishlist/ids'),
  add: (productId: string) =>
    request.post<{ productId: string }>('/wishlist', { productId }),
  remove: (productId: string) =>
    request.delete<{ productId: string }>(`/wishlist/${productId}`),
};

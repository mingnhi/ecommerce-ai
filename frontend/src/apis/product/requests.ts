import { request } from '../axios';
import { KEYS } from './keys';
import type {
  ProductDetailResponse,
  ProductListResponse,
  QueryProductRequest,
} from './types';

export const ProductService = {
  getAll: (query: QueryProductRequest = {}) => {
    return request.get<ProductListResponse>(KEYS.PRODUCTS, { params: query });
  },

  getBySlug: (slug: string) => {
    return request.get<ProductDetailResponse>(`${KEYS.PRODUCT_DETAIL}/${slug}`);
  },
};

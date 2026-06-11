import { request } from '../axios';
import { KEYS } from './keys';
import type {
  ProductDetailResponse,
  ProductListResponse,
  ProductPriceRangeResponse,
  QueryProductRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  ProductReviewsResponse,
  ReviewResponse,           // ← Thêm
} from './types';

export const ProductService = {
  getAll: (query: QueryProductRequest = {}) => {
    return request.get<ProductListResponse>(KEYS.PRODUCTS, { params: query });
  },

  getPriceRange: () => {
    return request.get<ProductPriceRangeResponse>(KEYS.PRICE_RANGE);
  },

  getBySlug: (slug: string) => {
    return request.get<ProductDetailResponse>(`${KEYS.PRODUCT_DETAIL}/${slug}`);
  },

  /** ====================== REVIEWS ====================== */

  createReview: (productId: string, data: CreateReviewRequest) => {
    return request.post<ReviewResponse>(
      `${KEYS.PRODUCT_REVIEWS}/${productId}/reviews`,
      data
    );
  },

  getReviews: (productId: string) => {
    return request.get<ProductReviewsResponse>(
      `${KEYS.PRODUCT_REVIEWS}/${productId}/reviews`
    );
  },

  // Admin only
  updateReview: (productId: string, reviewId: string, data: UpdateReviewRequest) => {
    return request.put<ReviewResponse>(
      `${KEYS.PRODUCT_REVIEWS}/${productId}/reviews/${reviewId}`,
      data
    );
  },

  deleteReview: (productId: string, reviewId: string) => {
    return request.delete<{ message: string }>(
      `${KEYS.PRODUCT_REVIEWS}/${productId}/reviews/${reviewId}`
    );
  },
};
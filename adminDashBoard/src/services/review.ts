import { httpClient } from "./http";
import type { Review, ReviewListResponse, UpdateReviewRequest } from "../features/reviews/types/review.type";

export const reviewService = {
    // Lấy tất cả reviews (Admin)
    getAllReviews: async (params?: {
    search?: string;
    productId?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }) => {
    const res = await httpClient.get('/products/admin/reviews', { params });
    return {
      reviews: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },
  // Lấy reviews theo sản phẩm
  getReviewsByProduct: async (productId: string) => {
    const res = await httpClient.get(`/products/${productId}/reviews`);
    return {
      reviews: (res.data?.data || []) as Review[],
    };
  },

  // Cập nhật review (Admin)
  updateReview: async (productId: string, reviewId: string, payload: UpdateReviewRequest) => {
    const res = await httpClient.put(`/products/${productId}/reviews/${reviewId}`, payload);
    return res.data;
  },

  // Xóa review (Admin)
  deleteReview: async (productId: string, reviewId: string) => {
    const res = await httpClient.delete(`/products/${productId}/reviews/${reviewId}`);
    return res.data;
  },
};

export default reviewService;
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  userName?: string;
  productId: string;
  productName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewListItem extends Review {}

export interface ReviewListResponse {
  data: Review[];
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export type ReviewListQuery = {
  search?: string;
  productId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
};
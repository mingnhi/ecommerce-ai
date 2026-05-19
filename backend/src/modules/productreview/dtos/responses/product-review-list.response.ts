import { ProductReviewResponse } from './product-review.response';

export class ProductReviewListResponse {
  items: ProductReviewResponse[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };

  summary: {
    averageRating: number;

    totalReviews: number;
  };
}


export class ProductReviewResponse {
  id: string;

  rating: number;

  comment?: string;

  user: {
    id: string;

    displayName?: string;

    avatarUrl?: string;
  };

  createdAt: Date;
}
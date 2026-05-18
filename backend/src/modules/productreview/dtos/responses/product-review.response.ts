export class ProductReviewResponse {
  id: string;

  rating: number;

  comment?: string;

  createdAt: Date;

  user: {
    id: string;

    email: string;

    displayName?: string;

    avatarUrl?: string;
  };
}


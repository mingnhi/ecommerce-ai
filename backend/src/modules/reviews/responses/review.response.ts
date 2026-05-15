export class ReviewResponse {
  id: string;

  productId: string;

  userId: string;

  rating: number;

  comment?: string;

  createdAt: Date;
}
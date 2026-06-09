export class ReviewResponse {
  id: string;

  rating: number;

  comment?: string;

  userId: string;

  userName?: string;

  createdAt: Date;
}
export class ProductSummaryResponse {
  id: string;

  name: string;

  slug: string;

  shortDescription?: string;

  thumbnail?: string;

  price?: number;

  originalPrice?: number;

  discountPercent?: number;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  createdAt: Date;
}
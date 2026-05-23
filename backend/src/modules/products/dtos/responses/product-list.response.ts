export class ProductListResponse {
  id: string;

  name: string;

  slug: string;

  shortDescription?: string;

  thumbnail?: string;

  isActive: boolean;

  category: {
    id: string;

    name: string;

    slug: string;
  };

  price?: {
    price: number;

    originalPrice?: number;

    discountPercent?: number;

    currency: string;
  };

  createdAt: Date;
}
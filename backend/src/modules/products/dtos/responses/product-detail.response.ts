export class ProductDetailResponse {
  id: string;

  name: string;

  slug: string;

  shortDescription?: string;

  description?: string;

  thumbnail?: string;

  isActive: boolean;

  createdAt: Date;

  updatedAt?: Date;

  category: {
    id: string;

    name: string;

    slug: string;
  };

  prices?: {
    price: number;

    originalPrice: number;

    discountPercent?: number;

    currency?: string;

    isActive?: boolean;
  }[];

  variants?: {
    title: string;

    sku: string;

    stock?: number;

    image?: string;

    price?: number;

    isActive?: boolean;

    attributes?: Record<
      string,
      any
    >;
  }[];

  attributes?: {
    name: string;

    value: string;
  }[];

  images: {
    id: string;

    imageUrl: string;

    type: string;

    sortOrder: number;

    isPrimary: boolean;
  }[];

  reviewSummary: {
    averageRating: number;

    totalReviews: number;
  };
}
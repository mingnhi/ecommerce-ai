export class ProductDetailResponse {
  id: string;

  name: string;

  slug: string;

  shortDescription?: string;

  description?: string;

  isActive: boolean;

  createdAt: Date;

  updatedAt?: Date;

  category: {
    id: string;

    name: string;

    slug: string;
  };

  prices: {
    id: string;

    price: number;

    originalPrice?: number;

    discountPercent?: number;

    currency: string;

    isActive: boolean;
  }[];

  variants: {
    id: string;

    title: string;

    sku: string;

    stock: number;

    image?: string;

    price?: number;

    isActive: boolean;

    attributes?: Record<
      string,
      any
    >;
  }[];

  attributes: {
    id: string;

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
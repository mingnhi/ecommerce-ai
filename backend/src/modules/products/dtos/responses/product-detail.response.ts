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

  prices: Array<{
    originalPrice: number;
    discountPercent?: number;
    price: number;
    currency: string;
    isActive: boolean;
  }>;

  variants: Array<{
    title: string;
    sku: string;
    stock: number;
    price?: number;
    image?: string;
    isActive: boolean;
    attributes?: Record<string, any>;
  }>;

  attributes: Array<{
    name: string;
    value: string;
  }>;

  images: Array<{
    id: string;
    imageUrl: string;
    type: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;

  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;

    user: {
      id: string;
      fullName?: string;
    };

    createdAt: Date;
  }>;
}
export type ProductPrice = {
  id: string;

  price: number;

  originalPrice?: number;

  discountPercent?: number;

  currency: string;

  isActive: boolean;
};

export type ProductVariant = {
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
};

export type ProductAttribute = {
  id: string;

  name: string;

  value: string;
};

export type ProductImage = {
  id: string;

  imageUrl: string;

  type: string;

  sortOrder: number;

  isPrimary: boolean;
};

export type ProductReviewSummary =
  {
    averageRating: number;

    totalReviews: number;
  };

export type Product = {
  id: string;

  name: string;

  slug: string;

  shortDescription?: string;

  description?: string;

  isActive: boolean;

  thumbnail?: string;

  createdAt: string;

  updatedAt?: string;

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

  prices?: ProductPrice[];

  variants?: ProductVariant[];

  attributes?: ProductAttribute[];

  images?: ProductImage[];

  reviewSummary?: ProductReviewSummary;
};

export type ProductQuery = {
  page?: number;

  limit?: number;

  search?: string;

  categoryId?: string;

  sort?: string;
};

export type CreateProductPayload =
  {
    categoryId: string;

    name: string;

    shortDescription?: string;

    description?: string;

    isActive?: boolean;

    prices?: {
      price: number;

      originalPrice?: number;

      discountPercent?: number;

      currency?: string;
    }[];

    variants?: {
      title: string;

      sku: string;

      stock?: number;

      image?: string;

      price?: number;

      attributes?: Record<
        string,
        any
      >;
    }[];

    attributes?: {
      name: string;

      value: string;
    }[];
  };

export type UpdateProductPayload =
  Partial<CreateProductPayload>;
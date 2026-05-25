export interface ProductPrice {
  id: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  currency: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  stock: number;
  image?: string;
  price?: number;
  isActive: boolean;
  attributes?: Record<string, any>;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  type: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;

  category: ProductCategory;

  prices: ProductPrice[];

  variants: ProductVariant[];

  attributes: ProductAttribute[];

  images: ProductImage[];

  reviewSummary: ProductReviewSummary;
}

export interface ProductListItem {
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

  createdAt: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductListResponse {
  products: ProductListItem[];
}

export interface ProductDetailResponse {
  product: Product;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sort?: string;
}

export interface CreateProductPayload {
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
    attributes?: Record<string, any>;
  }[];

  attributes?: {
    name: string;
    value: string;
  }[];
}

export interface UpdateProductPayload
  extends Partial<CreateProductPayload> {}
import type { ApiEnvelope } from '@/types/common';

export interface ProductPrice {
  price: number;
  originalPrice: number;
  discountPercent?: number;
  currency: string;
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  stock: number;
  price?: number;
  image?: string;
  isActive: boolean;
  attributes?: Record<string, unknown>;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  type: 'THUMBNAIL' | 'GALLERY' | 'ZOOM';
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
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
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  category: ProductCategory;
  price?: ProductPrice;
  prices?: ProductPrice[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  images: ProductImage[];
}

export interface ProductPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export type ProductListResponse = ApiEnvelope<Product[]> & {
  meta: ProductPaginationMeta;
};

export type ProductDetailResponse = ApiEnvelope<Product>;

export interface QueryProductRequest {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  sort?:
    | 'newest'
    | 'oldest'
    | 'name_asc'
    | 'name_desc'
    | 'price_asc'
    | 'price_desc';
}

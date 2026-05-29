// src/features/products/types/product.type.ts

/**
 * IMAGE TYPE ENUM
 */
export const ProductImageType = {
  THUMBNAIL: "THUMBNAIL",
  GALLERY: "GALLERY",
  ZOOM: "ZOOM",
} as const;

export type ProductImageType =
  (typeof ProductImageType)[keyof typeof ProductImageType];

/**
 * PRODUCT IMAGE
 */
export interface ProductImage {
  id: string;
  imageUrl: string;
  publicId?: string;
  type?: ProductImageType;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

/**
 * PRODUCT PRICE
 */
export interface ProductPrice {
  id?: string;
  originalPrice: number;
  discountPercent?: number;

  /**
   * BE calculate from originalPrice + discountPercent
   */
  price?: number;

  currency?: string;
  isActive?: boolean;

  /**
   * Optional pricing schedule
   */
  startAt?: string;
  endAt?: string;
}

/**
 * PRODUCT VARIANT
 */
export interface ProductVariant {
  id?: string;
  title: string;
  sku: string;
  stock?: number;
  price?: number;
  image?: string;
  isActive?: boolean;

  /**
   * Example:
   * { size: "M", color: "Red" }
   */
  attributes?: Record<string, string | number | boolean>;
}

/**
 * PRODUCT ATTRIBUTE
 */
export interface ProductAttribute {
  id?: string;
  name: string;
  value: string;
}

/**
 * PRODUCT REVIEW SUMMARY
 */
export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
}

/**
 * PRODUCT DETAIL
 */
export interface Product {
  id: string;
  name: string;
  slug: string;

  shortDescription?: string;
  description?: string;

  thumbnail?: string | null;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  prices?: ProductPrice[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  images?: ProductImage[];

  reviewSummary?: ProductReviewSummary | null;
}

/**
 * FORM VALUES
 * Used for create/update form
 */
export interface ProductFormValues {
  categoryId: string;
  name: string;

  shortDescription?: string;
  description?: string;

  isActive: boolean;

  prices: ProductPrice[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];

  /**
   * UI only
   * Do NOT send to BE
   */
  thumbnailFile?: File;
  galleryFiles?: File[];
}

/**
 * PRODUCT LIST ITEM
 * BE list response returns single price object
 */
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;

  shortDescription?: string;
  thumbnail?: string | null;

  isActive: boolean;
  createdAt?: string;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  price?: {
    originalPrice: number;
    discountPercent?: number;
    price: number;
    currency?: string;
  } | null;
}
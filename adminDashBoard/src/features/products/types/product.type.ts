export const ProductImageType = {
  THUMBNAIL: "THUMBNAIL",
  GALLERY: "GALLERY",
  ZOOM: "ZOOM",
} as const;

export type ProductImageType = (typeof ProductImageType)[keyof typeof ProductImageType];

export interface ProductImage {
  id: string;
  imageUrl: string;
  type: ProductImageType;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface ProductPrice {
  price: number;
  originalPrice: number;
  discountPercent?: number;
  currency?: string;
  isActive?: boolean;
}

export interface ProductVariant {
  title: string;
  sku: string;
  stock?: number;
  image?: string;
  price?: number;
  isActive?: boolean;
  attributes?: Record<string, any>;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
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
  reviewSummary?: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface ProductFormValues {
  categoryId: string;
  name: string;
  shortDescription?: string;
  description?: string;
  isActive: boolean;
  prices: ProductPrice[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  thumbnailFile?: File;
  galleryFiles?: File[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  price?: ProductPrice | null;
}
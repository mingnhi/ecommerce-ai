export interface ProductPrice {
  price: number;
  originalPrice: number;
  discountPercent?: number;
  currency: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  stock: number;
  price?: number;
  image?: string;
  isActive: boolean;
  attributes?: Record<string, any>;
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

  // API list products
  price: ProductPrice;

  // API product detail
  prices?: ProductPrice[];

  variants: ProductVariant[];

  attributes: ProductAttribute[];

  images: ProductImage[];
}

export interface ProductListResponse {
  status: string;
  message: string;

  data: Product[];

  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

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


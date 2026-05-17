export class ProductDetailResponse {
  id: string;

  name: string;

  slug: string;

  shortDescription?: string;

  description?: string;

  seoTitle?: string;

  seoDescription?: string;

  isActive: boolean;

  viewCount: number;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  prices: any[];

  variants: any[];

  images: any[];

  attributes: any[];

  reviews: any[];

  createdAt: Date;

  updatedAt?: Date;
}
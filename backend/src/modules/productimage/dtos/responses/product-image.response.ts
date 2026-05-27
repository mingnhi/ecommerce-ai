import { ProductImageType } from '@entities/product-image.entity';

export class ProductImageResponse {
  id: string;
  imageUrl: string;
  publicId: string;
  type: ProductImageType;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;

  constructor(partial: Partial<ProductImageResponse>) {
    Object.assign(this, partial);
  }
}
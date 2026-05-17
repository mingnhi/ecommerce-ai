import {
  ProductImageType,
} from '@entities/product-image.entity';

export class ProductImageResponse {
  id: string;

  imageUrl: string;

  type: ProductImageType;

  sortOrder: number;

  isPrimary: boolean;

  createdAt: Date;
}
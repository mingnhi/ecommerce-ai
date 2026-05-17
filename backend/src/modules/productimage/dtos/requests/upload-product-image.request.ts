import {
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';

import {
  ProductImageType,
} from '@entities/product-image.entity';

export class UploadProductImageRequest {
  @IsOptional()
  @IsEnum(ProductImageType)
  type?: ProductImageType;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
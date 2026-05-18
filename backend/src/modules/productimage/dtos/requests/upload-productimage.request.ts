// upload-productimage.request.ts

import {
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  ProductImageType,
} from '@entities/product-image.entity';

export class UploadProductImageRequest {
  @IsOptional()
  @IsEnum(ProductImageType)
  type?: ProductImageType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number = 0;
}
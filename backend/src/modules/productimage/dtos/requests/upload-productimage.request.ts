import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductImageType } from '@entities/product-image.entity';

export class UploadProductImageRequest {
  @IsOptional()
  @IsEnum(ProductImageType)
  type?: ProductImageType = ProductImageType.GALLERY;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
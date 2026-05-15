import {
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum ProductImageType {
  THUMBNAIL = 'THUMBNAIL',
  GALLERY = 'GALLERY',
  ZOOM = 'ZOOM',
}

export class UploadImageDto {
  @IsOptional()
  @IsEnum(ProductImageType)
  type?: ProductImageType =
    ProductImageType.GALLERY;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
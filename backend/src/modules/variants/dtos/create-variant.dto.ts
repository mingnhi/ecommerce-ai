import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<
    string,
    any
  >;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
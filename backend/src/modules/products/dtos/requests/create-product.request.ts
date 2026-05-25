import { Type } from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class ProductPriceRequest {
  @Type(() => Number)
  @IsNumber()
  originalPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class ProductVariantRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  attributes?: Record<
    string,
    any
  >;
}

class ProductAttributeRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductRequest {
  @IsUUID()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductPriceRequest)
  prices?: ProductPriceRequest[];

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductVariantRequest)
  variants?: ProductVariantRequest[];

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductAttributeRequest)
  attributes?: ProductAttributeRequest[];
}
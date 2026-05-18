import {
  Type,
} from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CreateProductPriceRequest {
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

class CreateProductVariantRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<
    string,
    any
  >;
}

class CreateProductAttributeRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductRequest {
  @IsString()
  @IsNotEmpty()
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
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()

  @ValidateNested({
    each: true,
  })

  @Type(
    () =>
      CreateProductPriceRequest,
  )
  prices?: CreateProductPriceRequest[];

  @IsOptional()
  @IsArray()

  @ValidateNested({
    each: true,
  })

  @Type(
    () =>
      CreateProductVariantRequest,
  )
  variants?: CreateProductVariantRequest[];

  @IsOptional()
  @IsArray()

  @ValidateNested({
    each: true,
  })

  @Type(
    () =>
      CreateProductAttributeRequest,
  )
  attributes?: CreateProductAttributeRequest[];
}
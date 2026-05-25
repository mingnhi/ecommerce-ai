import { Type } from 'class-transformer';

import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  /**
   * SEARCH
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * FILTER CATEGORY
   */
  @IsOptional()
  @IsString()
  categoryId?: string;

  /**
   * FILTER STATUS
   */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  /**
   * SORT
   */
  @IsOptional()
  @IsIn([
    'newest',
    'oldest',
    'name_asc',
    'name_desc',
    'price_asc',
    'price_desc',
  ])
  sort?: string = 'newest';
}
import { Type } from 'class-transformer';

import {
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

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}


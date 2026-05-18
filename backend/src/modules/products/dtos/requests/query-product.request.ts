import {
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductRequest {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

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
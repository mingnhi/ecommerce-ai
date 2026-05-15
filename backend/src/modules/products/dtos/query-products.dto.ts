import {
  IsBooleanString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsIn([
    'newest',
    'oldest',
    'name_asc',
    'name_desc',
  ])
  sort?: string = 'newest';
}
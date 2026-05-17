import {
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductsRequest {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  sort?: string = 'latest';
}
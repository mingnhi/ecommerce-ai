import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class QueryProductReviewRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsIn([
    'latest',
    'oldest',
  ])
  sort?: 'latest' | 'oldest' =
    'latest';
}


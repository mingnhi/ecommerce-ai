import {
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductReviewRequest {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: 'latest' | 'oldest';
}


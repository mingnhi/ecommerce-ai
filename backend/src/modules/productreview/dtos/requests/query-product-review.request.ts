import {
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductReviewRequest {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;
}
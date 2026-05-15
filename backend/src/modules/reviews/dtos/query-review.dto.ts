import {
  IsIn,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class QueryReviewDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  @IsIn([
    'latest',
    'oldest',
    'rating_desc',
    'rating_asc',
  ])
  sort?: string = 'latest';
}
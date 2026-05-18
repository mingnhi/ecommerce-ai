import {
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryCategoryRequest {
  @IsOptional()
  @IsString()
  type?: 'tree' | 'flat' = 'tree';
}


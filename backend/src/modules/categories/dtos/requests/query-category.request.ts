import {
  IsIn,
  IsOptional,
} from 'class-validator';

export class QueryCategoryRequest {
  @IsOptional()
  @IsIn(['tree', 'flat'])
  type?: 'tree' | 'flat' =
    'tree';
}
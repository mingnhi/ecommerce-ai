import {
  IsIn,
  IsOptional,
} from 'class-validator';

export class QueryCategoriesDto {
  @IsOptional()
  @IsIn(['tree', 'flat'])
  type?: string = 'flat';
}
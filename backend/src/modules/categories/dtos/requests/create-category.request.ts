import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryRequest {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string = '0';
}
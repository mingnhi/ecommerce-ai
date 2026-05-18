import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCategoryRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}


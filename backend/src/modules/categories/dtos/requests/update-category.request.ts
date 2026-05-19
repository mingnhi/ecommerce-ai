import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateCategoryRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}


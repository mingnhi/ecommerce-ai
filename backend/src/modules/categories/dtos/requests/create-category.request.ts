import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCategoryRequest {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}


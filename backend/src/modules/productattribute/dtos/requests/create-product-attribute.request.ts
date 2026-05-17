import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateProductAttributeRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
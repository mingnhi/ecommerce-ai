import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class GuestCartLineDto {
  @IsUUID()
  variantId: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

export class MergeCartDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => GuestCartLineDto)
  items: GuestCartLineDto[];
}

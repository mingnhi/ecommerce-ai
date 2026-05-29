import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, MaxLength, MinLength } from 'class-validator';
import { AddressType } from '../enums/address-type.enum';

export class CreateAddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  phone: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  addressLine: string;

  @Type(() => Number)
  @IsInt()
  provinceId: number;

  @Type(() => Number)
  @IsInt()
  wardId: number;

  @IsEnum(AddressType)
  type: AddressType;
}

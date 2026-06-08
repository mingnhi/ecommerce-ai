import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @Length(5, 500)
  shippingAddress: string;

  @IsString()
  @Length(5, 20)
  phone: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  cartItemIds: string[];
}

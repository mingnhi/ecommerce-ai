import {
  IsUUID, IsArray, ArrayMinSize, ValidateNested,
  IsInt, Min, IsString, IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddressDto {
  @ApiProperty({ example: '123 Nguyễn Huệ' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  city: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  phone: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

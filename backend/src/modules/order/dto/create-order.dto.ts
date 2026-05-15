import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description:
      'Địa chỉ giao hàng (free text). Khi có module Address, đổi sang addressId.',
    example: '123 Nguyễn Trãi, Q1, TP.HCM',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  shippingAddress: string;

  @ApiProperty({ description: 'Số điện thoại người nhận', example: '+84901234567' })
  @IsPhoneNumber('VN')
  phone: string;

  @ApiPropertyOptional({ description: 'Ghi chú', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ description: 'Mã voucher áp dụng', example: 'SUMMER10' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voucherCode?: string;
}

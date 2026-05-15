import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @ApiProperty({ example: '123 Đường ABC, Phường 1' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  addressLine: string;

  @ApiPropertyOptional({ example: 'Phường Bến Nghé' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'TP.HCM' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  province: string;

  @ApiPropertyOptional({ description: 'Set làm địa chỉ mặc định' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

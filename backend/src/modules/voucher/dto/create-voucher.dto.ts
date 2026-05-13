import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { VoucherDiscountType } from '@entities/voucher.entity';

export class CreateVoucherDto {
  @ApiProperty({ example: 'SUMMER10', description: 'Mã in hoa, không dấu' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Code chỉ chứa A-Z, 0-9, _, -' })
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ enum: VoucherDiscountType })
  @IsEnum(VoucherDiscountType)
  discountType: VoucherDiscountType;

  @ApiProperty({ example: '10', description: 'PERCENT: 1-100. FIXED: VND' })
  @IsNumberString()
  discountValue: string;

  @ApiPropertyOptional({ example: '0' })
  @IsOptional()
  @IsNumberString()
  minOrderAmount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  maxDiscount?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVoucherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ enum: VoucherDiscountType })
  @IsOptional()
  @IsEnum(VoucherDiscountType)
  discountType?: VoucherDiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  discountValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  minOrderAmount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  maxDiscount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApplyVoucherDto {
  @ApiProperty({ example: 'SUMMER10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '500000', description: 'Subtotal VND để check minOrderAmount' })
  @IsNumberString()
  subtotal: string;
}

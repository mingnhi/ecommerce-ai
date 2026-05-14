import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MovementType } from '../enums/movement-type.enum';

export class CreateMovementDto {
  @ApiProperty({ description: 'Variant ID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ enum: MovementType, description: 'Loại movement' })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ description: 'Số lượng (luôn dương)', minimum: 1, example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'ID tham chiếu (vd: order_id khi RESERVE/SELL)' })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Loại tham chiếu (vd: ORDER, MANUAL)' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Ghi chú', maxLength: 500 })
  @IsOptional()
  @IsString()
  note?: string;
}

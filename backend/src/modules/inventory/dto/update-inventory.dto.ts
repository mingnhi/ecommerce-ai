import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Số lượng available mới', minimum: 0, example: 100 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Warehouse ID (nullable nếu single warehouse)' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Ngưỡng cảnh báo sắp hết hàng', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Ghi chú lý do điều chỉnh', maxLength: 500 })
  @IsOptional()
  @IsString()
  note?: string;
}

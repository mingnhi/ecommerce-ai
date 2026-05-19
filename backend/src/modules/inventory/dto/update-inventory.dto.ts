import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}

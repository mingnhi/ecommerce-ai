import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

import { MovementType } from '../enums/movement-type.enum';

export class CreateMovementDto {
  @IsUUID()
  variantId: string;

  @IsEnum(MovementType)
  type: MovementType;

  // IMPORT/RESERVE/RELEASE/SELL bắt buộc > 0; ADJUST=0 dùng PATCH /inventories/:variantId
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  referenceType?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}

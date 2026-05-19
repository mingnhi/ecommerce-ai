import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ description: 'Variant ID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ description: 'Số lượng', minimum: 1, maximum: 999, example: 1 })
  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

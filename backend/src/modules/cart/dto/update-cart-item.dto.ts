import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Số lượng mới', minimum: 1, maximum: 999, example: 2 })
  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

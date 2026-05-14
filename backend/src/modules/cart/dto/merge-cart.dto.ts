import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { AddCartItemDto } from './add-cart-item.dto';

export class MergeCartDto {
  @ApiProperty({
    description: 'Danh sách item từ guest cart (localStorage) để merge vào server cart',
    type: [AddCartItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];
}

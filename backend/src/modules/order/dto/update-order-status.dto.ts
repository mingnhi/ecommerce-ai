import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}

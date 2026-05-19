import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @Length(5, 500)
  shippingAddress: string;

  @IsString()
  @Length(5, 20)
  phone: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;

  // Voucher code is accepted raw; discount = 0 cho đến khi có Voucher module
  // validate code/expiry/value. Server KHÔNG nhận discountAmount từ client.
  @IsOptional()
  @IsString()
  @Length(3, 50)
  @Matches(/^[A-Z0-9_-]+$/i, {
    message: 'voucherCode chỉ chứa chữ, số, "_" hoặc "-"',
  })
  voucherCode?: string;
}

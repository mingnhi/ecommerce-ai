import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateVnpayPaymentDto {
    // @IsNumber()
    // orderId: number;

    @IsNumber()
    amount: number;

    @IsString()
    @IsNotEmpty()
    orderInfo: string;
}
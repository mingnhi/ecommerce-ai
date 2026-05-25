import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { PaymentMethod } from "./payment.enum";

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;
}
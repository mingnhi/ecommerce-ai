import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, Length, Max, Min } from 'class-validator';
import { OtpType } from '../otp.enum';

export class VerifyOtpDto {
    @IsEmail()
    email!: string;

    @IsInt()
    @Min(100000)
    @Max(999999)
    otp!: number;

    @IsEnum(OtpType)
    type: OtpType;
}
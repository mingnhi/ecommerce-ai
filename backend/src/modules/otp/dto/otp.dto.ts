// src/modules/otp/dto/create-otp.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { OtpType } from '../otp.enum';

export class CreateOtpDto {
    @IsEmail()
    email!: string;

    @IsEnum(OtpType)
    type!: OtpType;
}

export class VerifyOtpDto {
    @IsEmail()
    email!: string;

    @Min(100000)
    @Max(999999)
    otp!: number;

    @IsEnum(OtpType)
    type!: OtpType;
}
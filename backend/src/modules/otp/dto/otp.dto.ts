// src/modules/otp/dto/create-otp.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
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

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp!: number;

    @IsEnum(OtpType)
    type!: OtpType;
}
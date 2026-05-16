// src/modules/otp/dto/create-otp.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { OtpType } from '@entities/otp.entity';

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
    otp!: string;

    @IsEnum(OtpType)
    type!: OtpType;
}
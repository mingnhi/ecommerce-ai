import { IsEmail, IsInt, IsNotEmpty, Length, Max, Min, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    email!: string;

    @IsInt()
    @Min(100000)
    @Max(999999)
    otp!: number;

    @MinLength(6)
    newPassword!: string;
}
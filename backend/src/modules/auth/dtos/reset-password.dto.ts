import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @Length(6, 6)
    otp!: string;

    @MinLength(6)
    newPassword!: string;
}
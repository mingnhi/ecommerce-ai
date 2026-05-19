import { Gender } from '@entities/userProfile.entity';
import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    avatarUrl?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;
}
export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto){}
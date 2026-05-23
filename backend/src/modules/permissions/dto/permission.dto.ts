import { PartialType } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    resource!: string;

    @IsNotEmpty()
    @IsString()
    action!: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class AssignPermissionsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    permissionIds!: string[];
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
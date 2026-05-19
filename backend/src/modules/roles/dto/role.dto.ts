import { PartialType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  description?: string;
}
export class AssignPermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  permissionIds!: string[];
}
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserRoleDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @IsNotEmpty()
  roleId!: string;
}

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  roleIds!: string[];
}

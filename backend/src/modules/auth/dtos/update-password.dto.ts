import { IsBoolean, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  currentPassword!: string;

  @MinLength(6)
  newPassword!: string;

  @IsOptional()
  @IsBoolean()
  logoutAllSessions?: boolean;
}

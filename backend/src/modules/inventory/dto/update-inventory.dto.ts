import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}

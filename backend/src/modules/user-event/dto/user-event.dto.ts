import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { UserEventType } from './user-event.enum';
import { Type } from 'class-transformer';

export class CreateUserEventDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;
    
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(UserEventType)
    eventType: UserEventType;
}
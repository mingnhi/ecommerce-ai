import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserEventType } from './user-event.enum';

export class CreateUserEventDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsEnum(UserEventType)
    eventType: UserEventType;
}
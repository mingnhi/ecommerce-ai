import { OmitType } from '@nestjs/swagger';

import { CreateUserEventDto } from './user-event.dto';

export class RecommendProductDto extends OmitType(
    CreateUserEventDto,
    ['eventType'] as const,
) { }
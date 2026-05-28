import {
    IsArray,
    IsNumber,
    IsOptional,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { RecommendProductDto } from './recommend.dto';

export class RecommendRequestDto {

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    top_k?: number;
}
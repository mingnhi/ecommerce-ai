import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { BehaviorType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class TrackBehaviorDto {
  @IsUUID()
  productId: string;

  @IsEnum(BehaviorType)
  action: BehaviorType;
}

@ApiTags('Behavior')
@Controller('behavior')
@UseGuards(JwtAuthGuard)
export class BehaviorController {
  constructor(private prisma: PrismaService) {}

  @Post('track')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ghi lại hành vi người dùng (VIEW, ADD_TO_CART...)' })
  async track(
    @CurrentUser('id') userId: string,
    @Body() dto: TrackBehaviorDto,
  ) {
    await this.prisma.userBehavior.create({
      data: { userId, productId: dto.productId, action: dto.action },
    });
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { CreateUserEventDto } from './dto/user-event.dto';
import { RecommendRequestDto } from './dto/recommendRequest.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('user-events')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateUserEventDto) {
    const data = await this.userEventService.create(req.user.sub, dto);

    return {
      status: 'success',
      message: 'User event saved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/me')
  async getMyRecommendations(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;

    const dto: RecommendRequestDto = {
      top_k: Number(limit) || 10,
    };

    return this.userEventService.recommend(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('recommend')
  async recommend(@Req() req: any, @Body() dto: RecommendRequestDto) {
    const userId =req.user.sub;

    // const response = await this.userEventService.recommend(
    //   userId,
    //   dto,
    // );

    return this.userEventService.recommend(userId, dto);
  }
}

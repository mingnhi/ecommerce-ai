import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { CreateUserEventDto } from './dto/user-event.dto';
import { RecommendRequestDto } from './dto/recommendRequest.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('user-events')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) { }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateUserEventDto) {
    const data = await this.userEventService.create(req.user.id, dto);

    return {
      status: 'success',
      message: 'User event saved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('recommend')
  async recommend(@Req() req: any, @Body() dto: RecommendRequestDto) {
    const data = await this.userEventService.recommend(req.user.sub, dto);

    return {
      status: 'success',
      message: 'Recommend products successfully',
      data,
    };
  }
}

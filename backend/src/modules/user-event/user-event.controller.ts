import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { CreateUserEventDto } from './dto/user-event.dto';

@Controller('user-events')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) { }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateUserEventDto) {
    const data = await this.userEventService.create(req.user.sub, dto);

    return {
      status: 'success',
      message: 'User event saved successfully',
      data,
    };
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { CreateUserEventDto } from './dto/user-event.dto';

@Controller('user-events')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) { }

  @Post()
  async create(@Req() req: unknown, @Body() dto: CreateUserEventDto) {
    const data = await this.userEventService.create(req.user.id, dto);

    return {
      status: 'success',
      message: 'User event saved successfully',
      data,
    };
  }
}

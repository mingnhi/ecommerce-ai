import { Module } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';
import { UserEvent } from '@entities/user-event.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserEvent]),
    HttpModule,
  ],
  controllers: [UserEventController],
  providers: [UserEventService],
  exports: [UserEventService],
})
export class UserEventModule {}

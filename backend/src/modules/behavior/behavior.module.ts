import { Module } from '@nestjs/common';
import { BehaviorController } from './behavior.controller';

@Module({
  controllers: [BehaviorController],
})
export class BehaviorModule {}

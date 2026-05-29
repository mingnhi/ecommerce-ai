import { Module } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';
import { UserEvent } from '@entities/user-event.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import { HttpModule } from '@nestjs/axios';
import { ProductEntity } from '@entities/product.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      UserEvent,
      ProductEntity,
      ProductVariantEntity,
    ]),
    HttpModule,
  ],
  controllers: [UserEventController],
  providers: [UserEventService],
  exports: [UserEventService],
})
export class UserEventModule {}

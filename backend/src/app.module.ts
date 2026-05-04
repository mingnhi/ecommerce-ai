import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BehaviorModule } from './modules/behavior/behavior.module';

@Module({
  imports: [
    // Cấu hình env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting toàn cục
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },  // 100 request / 60 giây
    ]),

    // BullMQ - hàng đợi tác vụ nền
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    RecommendationsModule,
    BehaviorModule,
  ],
})
export class AppModule {}

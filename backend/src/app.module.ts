import { Module } from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { mikroOrmConfig } from '@config/mikro-orm.config';

import { AppController } from './app.controller';

import { AppService } from './app.service';

/**
 * modules
 */
import { CategoryModule } from './modules/categories/categories.module';

import { ProductsModule } from './modules/products/products.module';

import { ProductImageModule } from './modules/productimage/productimage.module';

import { ProductReviewModule } from './modules/productreview/productreview.module';

@Module({
  imports: [
    /**
     * env
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * mikro orm
     */
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) =>
        mikroOrmConfig(
          configService,
        ),
    }),

    /**
     * modules
     */
    CategoryModule,

    ProductsModule,

    ProductImageModule,

    ProductReviewModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [AppService],
})
export class AppModule {}

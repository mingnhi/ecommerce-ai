import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import {
  mikroOrmConfig,
} from '@config/mikro-orm.config';

import { ProductsModule } from './modules/products/products.module';

import { CategoriesModule } from './modules/categories/categories.module';

import { VariantsModule } from './modules/variants/variants.module';

import { PricesModule } from './modules/prices/prices.module';

import { AttributesModule } from './modules/attributes/attributes.module';

import { ImagesModule } from './modules/images/images.module';

import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

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

    CategoriesModule,

    ProductsModule,

    VariantsModule,

    PricesModule,

    AttributesModule,

    ImagesModule,

    ReviewsModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
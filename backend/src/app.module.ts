import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { mikroOrmConfig } from '@config/mikro-orm.config';
import { UserRolesModule } from './modules/user-roles/user-roles.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { MailModule } from './modules/mail/mail.module';
import {ProductsModule} from "@modules/products/products.module";
import {CategoryModule} from "@modules/categories/categories.module";
import {ProductImageModule} from "@modules/productimage/productimage.module";
import {ProductReviewModule} from "@modules/productreview/productreview.module";

import { PaymentModule } from './modules/payment/payment.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { CloudinaryModule } from './modules/upload/upload.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { CartModule } from '@modules/cart/cart.module';
import { OrderModule } from '@modules/order/order.module';
import { UserEventModule } from './modules/user-event/user-event.module';
import { AddressModule } from '@modules/address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        mikroOrmConfig(configService),
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    UserRolesModule,
    AuthModule,
    PermissionsModule,
    MailModule,
    ProductsModule,
    CategoryModule,
    ProductImageModule,
    ProductReviewModule,
    PaymentModule,
    UserProfileModule,
    CloudinaryModule,
    InventoryModule,
    CartModule,
    OrderModule,
    UserEventModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

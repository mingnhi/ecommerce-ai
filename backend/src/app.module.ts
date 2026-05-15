import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { mikroOrmConfig } from '@config/mikro-orm.config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { InventoryModule } from '@modules/inventory/inventory.module';
import { CartModule } from '@modules/cart/cart.module';
import { OrderModule } from '@modules/order/order.module';
import { AuditModule } from '@modules/audit/audit.module';
import { VoucherModule } from '@modules/voucher/voucher.module';
import { WishlistModule } from '@modules/wishlist/wishlist.module';
import { AddressModule } from '@modules/address/address.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PriceModule } from '@modules/price/price.module';

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
    EventEmitterModule.forRoot(),
    AuditModule,
    AuthModule,
    PriceModule,
    InventoryModule,
    CartModule,
    OrderModule,
    VoucherModule,
    WishlistModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

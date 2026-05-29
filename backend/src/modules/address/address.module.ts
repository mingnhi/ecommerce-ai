import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Address } from '@entities/address.entity';
import { Province } from '@entities/province.entity';
import { Ward } from '@entities/ward.entity';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [MikroOrmModule.forFeature([Address, Province, Ward])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}

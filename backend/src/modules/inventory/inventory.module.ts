import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryEntity } from '@entities/inventory.entity';
import { InventoryMovementEntity } from '@entities/inventory-movement.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([InventoryEntity, InventoryMovementEntity]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

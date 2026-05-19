import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryEntity } from '@entities/inventory.entity';
import { InventoryMovementEntity } from '@entities/inventory-movement.entity';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { AdminGuard } from '@common/guards/admin.guard';

@Module({
  imports: [
    MikroOrmModule.forFeature([InventoryEntity, InventoryMovementEntity]),
    UserRolesModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService, AdminGuard],
  exports: [InventoryService],
})
export class InventoryModule {}

import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Permission } from '@entities/permissions.entity';
import { RolePermission } from '@entities/rolePermission.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Permission, RolePermission]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

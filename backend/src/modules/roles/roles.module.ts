import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Role } from '@entities/roles.entity';
import { Permission } from '@entities/permissions.entity';
import { RolePermission } from '@entities/rolePermission.entity';

@Module({
  imports:[ MikroOrmModule.forFeature([
    Role,
    Permission,
    RolePermission,
  ]),
],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}

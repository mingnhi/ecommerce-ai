import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserRole } from '@entities/userRoles.entity';
import { User } from '@entities/user.entity';
import { Role } from '@entities/roles.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      UserRole,
      User,
      Role,
    ]),
  ],

  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}

import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { User } from '@entities/user.entity';
import { UserProfile } from '@entities/userProfile.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([
    User,
    UserProfile
  ])],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}

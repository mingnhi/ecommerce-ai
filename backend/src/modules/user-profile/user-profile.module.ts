import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { User } from '@entities/user.entity';
import { UserProfile } from '@entities/userProfile.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

@Module({
  imports: [MikroOrmModule.forFeature([
    User,
    UserProfile
  ]),
    CloudinaryModule,
  ],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}

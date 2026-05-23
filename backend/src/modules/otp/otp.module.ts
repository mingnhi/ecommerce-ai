import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import { Otp } from '@entities/otp.entity';
import { User } from '@entities/user.entity';
import { MailModule } from '@modules/mail/mail.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Otp, User]),
    MailModule,
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}

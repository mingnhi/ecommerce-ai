import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from '@modules/roles/roles.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';

import { User } from '@entities/user.entity';
import { Role } from '@entities/roles.entity';
import { UserRole } from '@entities/userRoles.entity';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { MailService } from '../mail/mail.service';
import { OtpModule } from '@modules/otp/otp.module';
import { MailModule } from '@modules/mail/mail.module';
import { PermissionsModule } from '@modules/permissions/permissions.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OtpModule,
    MailModule,
    UserRolesModule,
    MikroOrmModule.forFeature([User, Role, UserRole]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRATION_TIME') ||
            '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtService,
    MailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtService],
})
export class AuthModule { }

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
    });
  }

  //
  validate(req: unknown, payload: unknown) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return { ...payload, refreshToken: token };
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const u = ctx.switchToHttp().getRequest().user ?? {};
    return {
      id: u.id ?? u.sub ?? '',
      email: u.email,
      roles: Array.isArray(u.roles) ? u.roles : [],
    };
  },
);

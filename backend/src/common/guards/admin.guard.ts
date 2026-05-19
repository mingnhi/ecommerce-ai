import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserRolesService } from '@modules/user-roles/user-roles.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userRolesService: UserRolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Thiếu access token');
    }

    const userRoles = await this.userRolesService.findByUser(userId);
    const isAdmin = userRoles.some(
      (ur) => ur.role?.name?.toUpperCase() === 'ADMIN',
    );
    if (!isAdmin) {
      throw new ForbiddenException('Yêu cầu quyền admin');
    }

    request.isAdmin = true;
    return true;
  }
}

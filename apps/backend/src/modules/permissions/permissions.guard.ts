import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../auth/constants/rbac.constants';
import type { CurrentUserContext } from '../auth/types/current-user-context.type';
import { PermissionsService } from './permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      currentUserContext?: CurrentUserContext;
      headers?: Record<string, string | string[] | undefined>;
    }>();

    const userContext = request.currentUserContext;
    if (!userContext) {
      throw new ForbiddenException('Missing user context');
    }

    const hasAllPermissions = this.permissionsService.hasCompanyPermissions(
      userContext,
      requiredPermissions,
      request.headers,
    );
    if (!hasAllPermissions) {
      throw new ForbiddenException('Missing required permissions');
    }

    return true;
  }
}

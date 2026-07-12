import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/rbac.constants';
import type { CurrentUserContext } from '../types/current-user-context.type';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      currentUserContext?: CurrentUserContext;
    }>();

    const userContext = request.currentUserContext;
    if (!userContext) {
      throw new ForbiddenException('Missing user context');
    }

    const companyAccess = this.permissionsService.resolveCompanyAccess(
      userContext,
      context.switchToHttp().getRequest<{
        headers?: Record<string, string | string[] | undefined>;
      }>().headers,
    );

    const hasRequiredRole = requiredRoles.some(
      (role) => companyAccess.role === role,
    );
    if (!hasRequiredRole) {
      throw new ForbiddenException('Missing required role');
    }

    return true;
  }
}

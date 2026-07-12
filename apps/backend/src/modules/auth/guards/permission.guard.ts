import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../constants/rbac.constants';
import type { CurrentUserContext } from '../types/current-user-context.type';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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
    }>();

    const userContext = request.currentUserContext;
    if (!userContext) {
      throw new ForbiddenException('Missing user context');
    }

    const companyIdHeader = this.getCompanyIdHeader(
      context.switchToHttp().getRequest<{ headers?: Record<string, string> }>(),
    );
    const effectivePermissions = companyIdHeader
      ? userContext.companies
          .filter((company) => company.companyId === companyIdHeader)
          .flatMap((company) => company.permissions)
      : userContext.permissions;

    const hasAllPermissions = requiredPermissions.every((permission) =>
      effectivePermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Missing required permissions');
    }

    return true;
  }

  private getCompanyIdHeader(request: {
    headers?: Record<string, string | string[] | undefined>;
  }): string | undefined {
    const rawHeader = request.headers?.['x-company-id'];
    if (Array.isArray(rawHeader)) {
      return rawHeader[0];
    }
    return rawHeader;
  }
}

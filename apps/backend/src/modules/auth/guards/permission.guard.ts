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

    const companyAccess = this.resolveCompanyAccess(
      userContext,
      context.switchToHttp().getRequest<{
        headers?: Record<string, string | string[] | undefined>;
      }>(),
    );
    const effectivePermissions = companyAccess.permissions;

    const hasAllPermissions = requiredPermissions.every((permission) =>
      effectivePermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Missing required permissions');
    }

    return true;
  }

  private resolveCompanyAccess(
    userContext: CurrentUserContext,
    request: {
      headers?: Record<string, string | string[] | undefined>;
    },
  ) {
    const companyIdHeader = this.getCompanyIdHeader(request);
    if (companyIdHeader) {
      const scopedAccess = userContext.companies.find(
        (company) => company.companyId === companyIdHeader,
      );
      if (!scopedAccess) {
        throw new ForbiddenException(
          'No active membership for provided company',
        );
      }
      return scopedAccess;
    }

    if (userContext.companies.length === 1) {
      return userContext.companies[0];
    }

    throw new ForbiddenException(
      'x-company-id header is required for multi-company users',
    );
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

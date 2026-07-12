import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/rbac.constants';
import type { CurrentUserContext } from '../types/current-user-context.type';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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

    const companyIdHeader = this.getCompanyIdHeader(
      context.switchToHttp().getRequest<{ headers?: Record<string, string> }>(),
    );
    const effectiveRoles = companyIdHeader
      ? userContext.companies
          .filter((company) => company.companyId === companyIdHeader)
          .map((company) => company.role)
      : userContext.roles;

    const hasRequiredRole = requiredRoles.some((role) =>
      effectiveRoles.includes(role),
    );
    if (!hasRequiredRole) {
      throw new ForbiddenException('Missing required role');
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

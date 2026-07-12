import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CurrentUserContext } from '../auth/types/current-user-context.type';

@Injectable()
export class PermissionsService {
  resolveCompanyAccess(
    userContext: CurrentUserContext,
    headers?: Record<string, string | string[] | undefined>,
  ) {
    if (userContext.companies.length === 0) {
      throw new ForbiddenException('No active membership in an active company');
    }
    const companyIdHeader = this.getCompanyIdHeader(headers);
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

  hasAllPermissions(
    userContext: CurrentUserContext,
    requiredPermissions: string[],
  ) {
    if (!requiredPermissions.length) {
      return true;
    }

    const permissionSet = new Set(userContext.permissions);
    return requiredPermissions.every((permission) =>
      permissionSet.has(permission),
    );
  }

  hasCompanyPermissions(
    userContext: CurrentUserContext,
    requiredPermissions: string[],
    headers?: Record<string, string | string[] | undefined>,
  ) {
    if (!requiredPermissions.length) {
      return true;
    }

    const companyAccess = this.resolveCompanyAccess(userContext, headers);
    const permissionSet = new Set(companyAccess.permissions);
    return requiredPermissions.every((permission) =>
      permissionSet.has(permission),
    );
  }

  private getCompanyIdHeader(
    headers?: Record<string, string | string[] | undefined>,
  ): string | undefined {
    const rawHeader = headers?.['x-company-id'];
    if (Array.isArray(rawHeader)) {
      return rawHeader[0];
    }
    return rawHeader;
  }
}

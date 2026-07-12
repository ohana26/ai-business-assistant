import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { JwtUser } from '../types/jwt-user.type';
import type {
  CompanyAccess,
  CurrentUserContext,
} from '../types/current-user-context.type';

@Injectable()
export class CurrentUserContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: JwtUser;
      currentUserContext?: CurrentUserContext;
    }>();

    if (!request.user?.userId) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    const memberships = await this.prisma.membership.findMany({
      where: {
        userId: request.user.userId,
        status: MembershipStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const companies: CompanyAccess[] = memberships.map((membership) => ({
      companyId: membership.companyId,
      membershipId: membership.id,
      role: membership.role.name,
      permissions: membership.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.key,
      ),
    }));

    const roleSet = new Set<string>();
    const permissionSet = new Set<string>();
    for (const companyAccess of companies) {
      roleSet.add(companyAccess.role);
      for (const permission of companyAccess.permissions) {
        permissionSet.add(permission);
      }
    }

    request.currentUserContext = {
      userId: request.user.userId,
      email: request.user.email,
      companies,
      roles: Array.from(roleSet),
      permissions: Array.from(permissionSet),
    };

    return true;
  }
}

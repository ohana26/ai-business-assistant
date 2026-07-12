import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AssignMembershipRoleDto } from './dto/assign-membership-role.dto';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listRoles(companyId: string) {
    return this.prisma.role.findMany({
      where: {
        deletedAt: null,
        OR: [{ companyId }, { isSystemRole: true, companyId: null }],
      },
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                key: true,
              },
            },
          },
        },
      },
      orderBy: [{ isSystemRole: 'desc' }, { name: 'asc' }],
    });
  }

  async createRole(companyId: string, actorUserId: string, dto: CreateRoleDto) {
    const normalizedName = dto.name.trim().toUpperCase();
    if (!normalizedName) {
      throw new BadRequestException('Role name is required');
    }

    const existing = await this.prisma.role.findFirst({
      where: {
        companyId,
        name: normalizedName,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Role name already exists for company');
    }

    const role = await this.prisma.role.create({
      data: {
        companyId,
        name: normalizedName,
        description: dto.description?.trim() || null,
        isSystemRole: false,
      },
    });

    await this.auditService.log({
      companyId,
      userId: actorUserId,
      action: 'role.created',
      resourceType: 'role',
      resourceId: role.id,
      metadata: {
        roleName: role.name,
      },
    });

    return role;
  }

  async updateRole(
    companyId: string,
    roleId: string,
    dto: UpdateRoleDto,
    actorUserId: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const nextName = dto.name?.trim().toUpperCase();
    if (nextName && nextName !== role.name) {
      const duplicate = await this.prisma.role.findFirst({
        where: {
          companyId,
          name: nextName,
          id: { not: roleId },
          deletedAt: null,
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new BadRequestException('Role name already exists for company');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: nextName,
        description:
          dto.description === undefined
            ? undefined
            : dto.description.trim() || null,
      },
    });

    await this.auditService.log({
      companyId,
      userId: actorUserId,
      action: 'role.updated',
      resourceType: 'role',
      resourceId: roleId,
      metadata: {
        previousName: role.name,
        currentName: updatedRole.name,
      },
    });

    return updatedRole;
  }

  async assignPermissionsToRole(
    companyId: string,
    roleId: string,
    dto: AssignRolePermissionsDto,
    actorUserId: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        deletedAt: null,
        OR: [{ companyId }, { isSystemRole: true, companyId: null }],
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissionKeys = Array.from(
      new Set(dto.permissionKeys.map((key) => key.trim()).filter(Boolean)),
    );
    if (permissionKeys.length === 0) {
      throw new BadRequestException(
        'permissionKeys must contain valid entries',
      );
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        key: { in: permissionKeys },
      },
      select: {
        id: true,
        key: true,
      },
    });
    if (permissions.length !== permissionKeys.length) {
      const found = new Set(permissions.map((permission) => permission.key));
      const missing = permissionKeys.filter((key) => !found.has(key));
      throw new BadRequestException(
        `Unknown permission keys: ${missing.join(', ')}`,
      );
    }

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });
    await this.prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    await this.auditService.log({
      companyId,
      userId: actorUserId,
      action: 'permission.added',
      resourceType: 'role',
      resourceId: role.id,
      metadata: {
        roleName: role.name,
        permissionKeys,
      },
    });

    return this.prisma.role.findUnique({
      where: { id: role.id },
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: { key: true },
            },
          },
        },
      },
    });
  }

  async assignRoleToMembership(
    companyId: string,
    membershipId: string,
    dto: AssignMembershipRoleDto,
    actorUserId: string,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        id: membershipId,
        companyId,
        status: MembershipStatus.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        roleId: true,
        userId: true,
      },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const role = await this.prisma.role.findFirst({
      where: {
        id: dto.roleId,
        deletedAt: null,
        OR: [{ companyId }, { isSystemRole: true, companyId: null }],
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updatedMembership = await this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        roleId: role.id,
      },
      select: {
        id: true,
        userId: true,
        roleId: true,
        companyId: true,
      },
    });

    await this.auditService.log({
      companyId,
      userId: actorUserId,
      action: 'role.assigned',
      resourceType: 'membership',
      resourceId: membership.id,
      metadata: {
        assignedRoleId: role.id,
        assignedRoleName: role.name,
        targetUserId: membership.userId,
      },
    });

    return updatedMembership;
  }
}

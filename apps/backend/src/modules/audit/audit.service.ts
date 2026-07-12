import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

type CreateAuditLogInput = {
  companyId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata,
      },
    });
  }

  async logLogin(userId: string, metadata?: Prisma.InputJsonValue) {
    return this.log({
      userId,
      action: 'login',
      resourceType: 'auth.session',
      resourceId: userId,
      metadata,
    });
  }

  async logLogout(userId: string, metadata?: Prisma.InputJsonValue) {
    return this.log({
      userId,
      action: 'logout',
      resourceType: 'auth.session',
      resourceId: userId,
      metadata,
    });
  }

  async logUserCreation(
    createdUserId: string,
    actorUserId?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.log({
      userId: actorUserId ?? createdUserId,
      action: 'user.creation',
      resourceType: 'user',
      resourceId: createdUserId,
      metadata,
    });
  }

  async logPermissionChange(
    companyId: string,
    actorUserId: string,
    resourceId: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.log({
      companyId,
      userId: actorUserId,
      action: 'permission.change',
      resourceType: 'role_permission',
      resourceId,
      metadata,
    });
  }

  async logDocumentAccess(
    companyId: string,
    actorUserId: string,
    documentId: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.log({
      companyId,
      userId: actorUserId,
      action: 'document.access',
      resourceType: 'document',
      resourceId: documentId,
      metadata,
    });
  }

  async logAssistantUsage(
    companyId: string,
    actorUserId: string,
    assistantId: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.log({
      companyId,
      userId: actorUserId,
      action: 'assistant.usage',
      resourceType: 'assistant',
      resourceId: assistantId,
      metadata,
    });
  }

  async logSystemRoleMutationAttempt(
    actorUserId: string,
    roleId: string,
    operation: 'update' | 'delete' | 'permissions.assign',
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.log({
      userId: actorUserId,
      action: 'role.system_mutation_attempt',
      resourceType: 'role',
      resourceId: roleId,
      metadata: {
        operation,
        ...(metadata && typeof metadata === 'object' ? metadata : {}),
      },
    });
  }
}

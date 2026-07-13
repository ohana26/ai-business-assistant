import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtUser } from './types/jwt-user.type';
import type { AuthTokens, AuthResponse } from './types/auth-response.type';
import { AuditService } from '../audit/audit.service';
import { RBAC_PERMISSIONS, RBAC_ROLES } from './constants/rbac.constants';

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 12;
  private readonly refreshTokenSaltRounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.passwordSaltRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email.toLowerCase(),
        passwordHash,
        displayName: registerDto.displayName,
        status: UserStatus.ACTIVE,
      },
    });

    const onboarding = await this.provisionDefaultTenantContext(
      user.id,
      user.email,
      {
        companyName: registerDto.companyName,
        workspaceName: registerDto.workspaceName,
      },
    );

    await this.auditService.logUserCreation(user.id, user.id, {
      email: user.email,
      source: 'auth.register',
    });

    return this.issueTokensForUser(user, true, onboarding);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase() },
    });

    if (!user || user.deletedAt || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.auditService.logLogin(user.id, {
      email: user.email,
      source: 'auth.login',
    });

    const onboarding = await this.ensureUserTenantContext(user.id, user.email);
    return this.issueTokensForUser(user, true, onboarding);
  }

  async refreshToken(
    user: JwtUser,
    rawRefreshToken: string,
  ): Promise<AuthResponse> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: user.tokenId },
    });

    if (
      !storedToken ||
      storedToken.userId !== user.userId ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await bcrypt.compare(
      rawRefreshToken,
      storedToken.tokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const userEntity = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (
      !userEntity ||
      userEntity.deletedAt ||
      userEntity.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('User is not active');
    }

    return this.issueTokensForUser(userEntity, false);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await this.auditService.logLogout(userId, {
      source: 'auth.logout',
    });
  }

  private async issueTokensForUser(
    user: Pick<User, 'id' | 'email' | 'displayName'>,
    includeProfile: boolean,
    onboarding?: {
      companyId: string;
      workspaceId: string;
      collectionId: string;
    },
  ): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      tokens.refreshTokenId,
    );

    return {
      user: includeProfile
        ? {
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? null,
          }
        : undefined,
      onboarding,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async provisionDefaultTenantContext(
    userId: string,
    email: string,
    options?: {
      companyName?: string;
      workspaceName?: string;
    },
  ) {
    const emailPrefix = email.split('@')[0] ?? 'company';
    const companyName =
      options?.companyName?.trim() || `${emailPrefix} Company`;
    const workspaceName = options?.workspaceName?.trim() || 'Default Workspace';
    const collectionName = 'General';
    const baseSlug =
      this.toSlug(companyName) || this.toSlug(emailPrefix) || 'company';
    const suffix = randomUUID().slice(0, 8);
    const companySlug = `${baseSlug}-${suffix}`;
    const workspaceSlug = this.toSlug(workspaceName) || 'workspace';
    const knowledgeBaseName = `${workspaceName} Knowledge Base`;
    const knowledgeBaseSlug = `${this.toSlug(workspaceName) || 'workspace'}-kb`;
    const collectionSlug = this.toSlug(collectionName) || 'general';

    return this.prisma.$transaction(async (tx) => {
      const roleId = await this.ensureDefaultUserRole(tx);

      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: companySlug,
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const membership = await tx.membership.create({
        data: {
          userId,
          companyId: company.id,
          roleId,
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
        select: { id: true },
      });

      const workspace = await tx.workspace.create({
        data: {
          companyId: company.id,
          name: workspaceName,
          slug: workspaceSlug,
          description: 'Workspace created during onboarding',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      await tx.workspaceMembership.create({
        data: {
          membershipId: membership.id,
          workspaceId: workspace.id,
          workspaceRole: 'MEMBER',
        },
      });

      const knowledgeBase = await tx.knowledgeBase.create({
        data: {
          companyId: company.id,
          workspaceId: workspace.id,
          name: knowledgeBaseName,
          slug: knowledgeBaseSlug,
          description: 'Knowledge base created during onboarding',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const collection = await tx.collection.create({
        data: {
          companyId: company.id,
          knowledgeBaseId: knowledgeBase.id,
          name: collectionName,
          slug: collectionSlug,
          description: 'Default collection for uploaded documents',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      return {
        companyId: company.id,
        workspaceId: workspace.id,
        collectionId: collection.id,
      };
    });
  }

  private async ensureUserTenantContext(userId: string, email: string) {
    const activeMembership = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        deletedAt: null,
        company: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!activeMembership) {
      return this.provisionDefaultTenantContext(userId, email);
    }

    const workspaceMembership = await this.prisma.workspaceMembership.findFirst(
      {
        where: {
          membershipId: activeMembership.id,
          deletedAt: null,
          workspace: {
            companyId: activeMembership.companyId,
            status: 'ACTIVE',
            deletedAt: null,
          },
        },
        select: { workspaceId: true },
        orderBy: { createdAt: 'asc' },
      },
    );
    if (!workspaceMembership) {
      const workspace = await this.prisma.workspace.create({
        data: {
          companyId: activeMembership.companyId,
          name: 'Default Workspace',
          slug: `workspace-${randomUUID().slice(0, 8)}`,
          description: 'Workspace created during login recovery',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      await this.prisma.workspaceMembership.create({
        data: {
          membershipId: activeMembership.id,
          workspaceId: workspace.id,
          workspaceRole: 'MEMBER',
        },
      });

      const knowledgeBase = await this.prisma.knowledgeBase.create({
        data: {
          companyId: activeMembership.companyId,
          workspaceId: workspace.id,
          name: 'Default Workspace Knowledge Base',
          slug: `workspace-kb-${randomUUID().slice(0, 8)}`,
          description: 'Knowledge base created during login recovery',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const collection = await this.prisma.collection.create({
        data: {
          companyId: activeMembership.companyId,
          knowledgeBaseId: knowledgeBase.id,
          name: 'General',
          slug: `general-${randomUUID().slice(0, 8)}`,
          description: 'Default collection created during login recovery',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      return {
        companyId: activeMembership.companyId,
        workspaceId: workspace.id,
        collectionId: collection.id,
      };
    }

    const knowledgeBase = await this.prisma.knowledgeBase.findFirst({
      where: {
        companyId: activeMembership.companyId,
        workspaceId: workspaceMembership.workspaceId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!knowledgeBase) {
      const createdKnowledgeBase = await this.prisma.knowledgeBase.create({
        data: {
          companyId: activeMembership.companyId,
          workspaceId: workspaceMembership.workspaceId,
          name: 'Default Workspace Knowledge Base',
          slug: `workspace-kb-${randomUUID().slice(0, 8)}`,
          description: 'Knowledge base created during login recovery',
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      const createdCollection = await this.prisma.collection.create({
        data: {
          companyId: activeMembership.companyId,
          knowledgeBaseId: createdKnowledgeBase.id,
          name: 'General',
          slug: `general-${randomUUID().slice(0, 8)}`,
          description: 'Default collection created during login recovery',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      return {
        companyId: activeMembership.companyId,
        workspaceId: workspaceMembership.workspaceId,
        collectionId: createdCollection.id,
      };
    }

    const collection = await this.prisma.collection.findFirst({
      where: {
        companyId: activeMembership.companyId,
        knowledgeBaseId: knowledgeBase.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!collection) {
      const createdCollection = await this.prisma.collection.create({
        data: {
          companyId: activeMembership.companyId,
          knowledgeBaseId: knowledgeBase.id,
          name: 'General',
          slug: `general-${randomUUID().slice(0, 8)}`,
          description: 'Default collection created during login recovery',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      return {
        companyId: activeMembership.companyId,
        workspaceId: workspaceMembership.workspaceId,
        collectionId: createdCollection.id,
      };
    }

    return {
      companyId: activeMembership.companyId,
      workspaceId: workspaceMembership.workspaceId,
      collectionId: collection.id,
    };
  }
  private async ensureDefaultUserRole(tx: Prisma.TransactionClient) {
    const existingRole = await tx.role.findFirst({
      where: {
        companyId: null,
        name: RBAC_ROLES.USER,
        isSystemRole: true,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existingRole) {
      return existingRole.id;
    }

    const requiredPermissionKeys = [
      RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD,
      RBAC_PERMISSIONS.KNOWLEDGE_VIEW,
      RBAC_PERMISSIONS.ASSISTANT_CHAT,
    ];

    for (const key of requiredPermissionKeys) {
      await tx.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: key },
      });
    }

    const role = await tx.role.create({
      data: {
        name: RBAC_ROLES.USER,
        description: 'USER default role',
        isSystemRole: true,
      },
      select: { id: true },
    });

    const permissions = await tx.permission.findMany({
      where: { key: { in: requiredPermissionKeys } },
      select: { id: true },
    });
    await tx.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    return role.id;
  }

  private toSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const refreshTokenId = randomUUID();
    const accessTokenPayload = { sub: userId, email };
    const refreshTokenPayload = { sub: userId, email, tokenId: refreshTokenId };
    const accessSecret = this.getRequiredConfig('JWT_ACCESS_SECRET');
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.durationToSeconds(
      this.getRequiredConfig('JWT_ACCESS_EXPIRES_IN'),
    );
    const refreshExpiresIn = this.durationToSeconds(
      this.getRequiredConfig('JWT_REFRESH_EXPIRES_IN'),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken, refreshTokenId };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    refreshTokenId: string,
  ): Promise<void> {
    const decoded: unknown = this.jwtService.decode(refreshToken);
    if (!decoded || typeof decoded !== 'object') {
      throw new UnauthorizedException('Invalid refresh token expiration');
    }
    const decodedPayload = decoded as Record<string, unknown>;
    const exp = decodedPayload.exp;
    if (typeof exp !== 'number') {
      throw new UnauthorizedException('Invalid refresh token expiration');
    }

    const tokenHash = await bcrypt.hash(
      refreshToken,
      this.refreshTokenSaltRounds,
    );

    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId,
        tokenHash,
        expiresAt: new Date(exp * 1000),
      },
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new UnauthorizedException(`${key} is not configured`);
    }

    return value;
  }

  private durationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/i.exec(duration.trim());
    if (!match) {
      throw new UnauthorizedException(
        `Invalid JWT duration format: ${duration}`,
      );
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * multiplier[unit];
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUserProfile(userId: string) {
    return this.prisma.userProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        userId: true,
        department: true,
        jobTitle: true,
        location: true,
        securityLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async upsertCurrentUserProfile(userId: string, dto: UpdateUserProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        department: dto.department,
        jobTitle: dto.jobTitle,
        location: dto.location,
        securityLevel: dto.securityLevel,
      },
      update: {
        department: dto.department,
        jobTitle: dto.jobTitle,
        location: dto.location,
        securityLevel: dto.securityLevel,
        deletedAt: null,
      },
      select: {
        userId: true,
        department: true,
        jobTitle: true,
        location: true,
        securityLevel: true,
        updatedAt: true,
      },
    });
  }

  async listCurrentUserAttributes(userId: string) {
    return this.prisma.userAttribute.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        key: true,
        value: true,
        updatedAt: true,
      },
      orderBy: {
        key: 'asc',
      },
    });
  }

  async upsertCurrentUserAttribute(userId: string, key: string, value: string) {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new BadRequestException('Attribute key is required');
    }

    const existingAttribute = await this.prisma.userAttribute.findFirst({
      where: {
        userId,
        key: normalizedKey,
      },
      select: { id: true },
    });

    if (existingAttribute) {
      return this.prisma.userAttribute.update({
        where: { id: existingAttribute.id },
        data: {
          value,
          deletedAt: null,
        },
        select: {
          id: true,
          key: true,
          value: true,
          updatedAt: true,
        },
      });
    }

    return this.prisma.userAttribute.create({
      data: {
        userId,
        key: normalizedKey,
        value,
      },
      select: {
        id: true,
        key: true,
        value: true,
        updatedAt: true,
      },
    });
  }

  async removeCurrentUserAttribute(userId: string, key: string) {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new BadRequestException('Attribute key is required');
    }

    const result = await this.prisma.userAttribute.updateMany({
      where: {
        userId,
        key: normalizedKey,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      key: normalizedKey,
      removed: result.count > 0,
    };
  }
}

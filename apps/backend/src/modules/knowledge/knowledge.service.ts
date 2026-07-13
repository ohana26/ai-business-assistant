import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AssetContentType,
  KnowledgeAssetStatus,
  MembershipStatus,
  UserStatus,
} from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RBAC_PERMISSIONS } from '../auth/constants/rbac.constants';
import type { CurrentUserContext } from '../auth/types/current-user-context.type';
import type { StorageProvider } from '../storage/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER_TOKEN } from '../storage/storage.constants';
import { UploadKnowledgeAssetDto } from './dto/upload-knowledge-asset.dto';
import { ListKnowledgeAssetsDto } from './dto/list-knowledge-assets.dto';
import { KnowledgeIngestionService } from './services/knowledge-ingestion.service';
import type { UploadedKnowledgeFile } from './types/uploaded-knowledge-file.type';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly knowledgeIngestionService: KnowledgeIngestionService,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: StorageProvider,
  ) {}

  async listKnowledgeAssets(
    userContext: CurrentUserContext,
    companyId: string | undefined,
    workspaceId: string | undefined,
    query: ListKnowledgeAssetsDto,
  ) {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
    if (!workspaceId) {
      throw new BadRequestException('x-workspace-id header is required');
    }

    const companyAccess = userContext.companies.find(
      (company) => company.companyId === companyId,
    );
    if (!companyAccess) {
      throw new ForbiddenException(
        'User is not a member of the provided company',
      );
    }
    if (!companyAccess.permissions.includes(RBAC_PERMISSIONS.KNOWLEDGE_VIEW)) {
      throw new ForbiddenException('Missing required permissions');
    }

    const [user, workspaceMembership] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: userContext.userId,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        select: { id: true },
      }),
      this.prisma.workspaceMembership.findFirst({
        where: {
          membershipId: companyAccess.membershipId,
          deletedAt: null,
          workspaceId,
          membership: {
            status: MembershipStatus.ACTIVE,
            deletedAt: null,
          },
          workspace: {
            companyId,
            status: 'ACTIVE',
            deletedAt: null,
          },
        },
        select: { id: true },
      }),
    ]);
    if (!user) {
      throw new ForbiddenException('User is not active');
    }
    if (!workspaceMembership) {
      throw new ForbiddenException(
        'User does not have active access to the requested workspace',
      );
    }

    const assets = await this.prisma.knowledgeAsset.findMany({
      where: {
        companyId,
        status: query.status,
        deletedAt: null,
        collection: {
          deletedAt: null,
          knowledgeBase: {
            workspaceId,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        source: {
          select: { name: true },
        },
        _count: {
          select: { chunks: true },
        },
      },
    });

    await this.auditService.log({
      companyId,
      userId: userContext.userId,
      action: 'knowledge.asset.viewed',
      resourceType: 'knowledge.asset',
      metadata: {
        workspaceId,
        status: query.status ?? null,
        returnedCount: assets.length,
      },
    });

    return {
      items: assets.map((asset) => ({
        id: asset.id,
        title: asset.title,
        filename: asset.filename,
        source: asset.source?.name ?? null,
        status: asset.status,
        chunksCount: asset._count.chunks,
        uploadedAt: asset.createdAt.toISOString(),
        sizeBytes: asset.sizeBytes?.toString() ?? '0',
      })),
    };
  }

  async uploadKnowledgeAsset(
    userContext: CurrentUserContext,
    file: UploadedKnowledgeFile | undefined,
    dto: UploadKnowledgeAssetDto,
    companyId: string | undefined,
    workspaceId: string | undefined,
  ) {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
    if (!workspaceId) {
      throw new BadRequestException('x-workspace-id header is required');
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const companyAccess = userContext.companies.find(
      (company) => company.companyId === companyId,
    );
    if (!companyAccess) {
      throw new ForbiddenException(
        'User is not a member of the provided company',
      );
    }
    if (
      !companyAccess.permissions.includes(RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD)
    ) {
      throw new ForbiddenException('Missing required permissions');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userContext.userId,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!user) {
      throw new ForbiddenException('User is not active');
    }

    const workspaceMembership = await this.prisma.workspaceMembership.findFirst(
      {
        where: {
          membershipId: companyAccess.membershipId,
          deletedAt: null,
          workspaceId,
          membership: {
            status: MembershipStatus.ACTIVE,
            deletedAt: null,
          },
          workspace: {
            companyId,
            status: 'ACTIVE',
            deletedAt: null,
          },
        },
        select: { id: true },
      },
    );
    if (!workspaceMembership) {
      throw new ForbiddenException(
        'User does not have active access to the requested workspace',
      );
    }

    const collection = await this.prisma.collection.findFirst({
      where: {
        id: dto.collectionId,
        companyId,
        deletedAt: null,
        knowledgeBase: {
          companyId,
          workspaceId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      select: {
        id: true,
        knowledgeBaseId: true,
      },
    });
    if (!collection) {
      throw new ForbiddenException(
        'Collection is not accessible in the requested workspace',
      );
    }

    if (dto.sourceId) {
      const source = await this.prisma.knowledgeSource.findFirst({
        where: {
          id: dto.sourceId,
          companyId,
          knowledgeBaseId: collection.knowledgeBaseId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!source) {
        throw new ForbiddenException(
          'Knowledge source is not accessible in the requested workspace',
        );
      }
    }

    const safeFilename = this.sanitizeFilename(file.originalname);
    const storagePath = this.buildStoragePath(
      companyId,
      workspaceId,
      safeFilename,
    );
    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    await this.storageProvider.upload(file.buffer, storagePath, file.mimetype);

    let createdAsset: {
      id: string;
      filename: string;
      contentType: AssetContentType;
      status: KnowledgeAssetStatus;
      sizeBytes: bigint | null;
      storagePath: string | null;
    };
    try {
      createdAsset = await this.prisma.$transaction(async (tx) => {
        const asset = await tx.knowledgeAsset.create({
          data: {
            companyId,
            collectionId: collection.id,
            sourceId: dto.sourceId,
            createdByUserId: userContext.userId,
            filename: safeFilename,
            title: safeFilename,
            contentType: this.mapContentType(file),
            status: KnowledgeAssetStatus.UPLOADED,
            mimeType: file.mimetype || null,
            checksum,
            storagePath,
            sizeBytes: BigInt(file.size),
          },
        });

        await tx.documentMetadata.create({
          data: {
            companyId,
            knowledgeAssetId: asset.id,
            metadata: {
              filename: safeFilename,
              size: file.size,
              mimeType: file.mimetype,
              workspaceId,
            },
          },
        });

        return asset;
      });

      await this.auditService.log({
        companyId,
        userId: userContext.userId,
        action: 'knowledge.asset.uploaded',
        resourceType: 'knowledge.asset',
        resourceId: createdAsset.id,
        metadata: {
          filename: safeFilename,
          size: file.size,
          mimeType: file.mimetype,
          workspaceId,
          collectionId: dto.collectionId,
        },
      });
    } catch {
      await this.storageProvider.delete(storagePath).catch(() => undefined);
      throw new InternalServerErrorException(
        'Failed to persist uploaded asset',
      );
    }

    try {
      await this.prisma.knowledgeAsset.update({
        where: { id: createdAsset.id },
        data: { status: KnowledgeAssetStatus.PROCESSING },
      });
      await this.knowledgeIngestionService.ingestUploadedAsset(
        this.storageProvider,
        createdAsset.id,
      );
      createdAsset = await this.prisma.knowledgeAsset.findUniqueOrThrow({
        where: { id: createdAsset.id },
        select: {
          id: true,
          filename: true,
          contentType: true,
          status: true,
          sizeBytes: true,
          storagePath: true,
        },
      });
    } catch {
      await this.prisma.knowledgeAsset.update({
        where: { id: createdAsset.id },
        data: { status: KnowledgeAssetStatus.FAILED },
      });
      throw new InternalServerErrorException('Failed to ingest uploaded asset');
    }

    return {
      id: createdAsset.id,
      filename: createdAsset.filename,
      contentType: createdAsset.contentType,
      status: createdAsset.status,
      sizeBytes: createdAsset.sizeBytes?.toString() ?? '0',
      storagePath: createdAsset.storagePath,
    };
  }

  private buildStoragePath(
    companyId: string,
    workspaceId: string,
    filename: string,
  ): string {
    return `companies/${companyId}/workspaces/${workspaceId}/documents/${randomUUID()}-${filename}`;
  }

  private sanitizeFilename(filename: string): string {
    const trimmed = filename.trim();
    const safe = trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
    return safe || 'document';
  }

  private mapContentType(file: UploadedKnowledgeFile): AssetContentType {
    const ext = extname(file.originalname).toLowerCase();
    switch (ext) {
      case '.pdf':
        return AssetContentType.PDF;
      case '.docx':
        return AssetContentType.DOCX;
      case '.txt':
        return AssetContentType.TXT;
      case '.md':
        return AssetContentType.MARKDOWN;
      case '.html':
      case '.htm':
        return AssetContentType.HTML;
      case '.csv':
        return AssetContentType.CSV;
      case '.json':
        return AssetContentType.JSON;
      default:
        return AssetContentType.OTHER;
    }
  }
}

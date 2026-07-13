import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AssetContentType,
  KnowledgeAssetStatus,
  KnowledgeSource,
  KnowledgeSourceStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConnectorRegistryService } from './connector-registry.service';
import type {
  ConnectorConfig,
  ConnectorFetchedItem,
} from './types/connector.types';

@Injectable()
export class ConnectorSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly connectorRegistry: ConnectorRegistryService,
  ) {}

  async syncSource(source: KnowledgeSource, actorUserId: string) {
    const connector = this.connectorRegistry.resolve(source.sourceType);
    const context = { source };

    await this.auditService.log({
      companyId: source.companyId,
      userId: actorUserId,
      action: 'connector.sync.started',
      resourceType: 'knowledge.source',
      resourceId: source.id,
      metadata: { sourceType: source.sourceType },
    });

    try {
      await connector.authenticate(context);
      const validation = await connector.validateConnection(context);
      if (!validation.valid) {
        throw new BadRequestException(
          validation.reason ?? 'Connector validation failed',
        );
      }

      const syncResult = await connector.sync(context);
      const fetchedItems = await connector.fetch(context);
      const targetCollectionId = this.requireTargetCollectionId(source);

      const persistedAssets = await this.prisma.$transaction(async (tx) => {
        const collection = await tx.collection.findFirst({
          where: {
            id: targetCollectionId,
            companyId: source.companyId,
            knowledgeBaseId: source.knowledgeBaseId,
            deletedAt: null,
          },
          select: { id: true },
        });
        if (!collection) {
          throw new NotFoundException(
            'Target collection for connector sync was not found',
          );
        }

        const assetIds: string[] = [];
        for (const item of fetchedItems) {
          const asset = await this.upsertAssetForItem(
            tx,
            source,
            collection.id,
            item,
          );
          assetIds.push(asset.id);
        }

        await tx.knowledgeSource.update({
          where: { id: source.id },
          data: {
            status: KnowledgeSourceStatus.ACTIVE,
            lastSyncedAt: new Date(),
            syncState: {
              lastSync: {
                cursor: syncResult.nextCursor ?? null,
                fetchedCount: syncResult.fetchedCount,
                persistedCount: assetIds.length,
                completedAt: new Date().toISOString(),
              },
            },
          },
        });

        return assetIds;
      });

      await this.auditService.log({
        companyId: source.companyId,
        userId: actorUserId,
        action: 'connector.sync.completed',
        resourceType: 'knowledge.source',
        resourceId: source.id,
        metadata: {
          sourceType: source.sourceType,
          fetchedCount: syncResult.fetchedCount,
          persistedCount: persistedAssets.length,
        },
      });

      return {
        sourceId: source.id,
        fetchedCount: syncResult.fetchedCount,
        persistedCount: persistedAssets.length,
      };
    } catch (error) {
      await this.auditService.log({
        companyId: source.companyId,
        userId: actorUserId,
        action: 'connector.sync.failed',
        resourceType: 'knowledge.source',
        resourceId: source.id,
        metadata: {
          sourceType: source.sourceType,
          error:
            error instanceof Error ? error.message : 'Unknown sync failure',
        },
      });

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Connector sync failed');
    }
  }

  async connectSource(source: KnowledgeSource, actorUserId: string) {
    const connector = this.connectorRegistry.resolve(source.sourceType);
    const context = { source };
    await connector.authenticate(context);
    const validation = await connector.validateConnection(context);
    if (!validation.valid) {
      throw new BadRequestException(
        validation.reason ?? 'Connector validation failed',
      );
    }

    await this.prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: KnowledgeSourceStatus.ACTIVE },
    });
    await this.auditService.log({
      companyId: source.companyId,
      userId: actorUserId,
      action: 'connector.connected',
      resourceType: 'knowledge.source',
      resourceId: source.id,
      metadata: { sourceType: source.sourceType },
    });
  }

  async disconnectSource(source: KnowledgeSource, actorUserId: string) {
    const connector = this.connectorRegistry.resolve(source.sourceType);
    await connector.disconnect({ source });

    await this.prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: KnowledgeSourceStatus.PAUSED },
    });
    await this.auditService.log({
      companyId: source.companyId,
      userId: actorUserId,
      action: 'connector.disconnected',
      resourceType: 'knowledge.source',
      resourceId: source.id,
      metadata: { sourceType: source.sourceType },
    });
  }

  private requireTargetCollectionId(source: KnowledgeSource): string {
    const config = (source.connectorConfig ?? {}) as ConnectorConfig;
    if (!config.targetCollectionId) {
      throw new BadRequestException(
        'Connector configuration must include targetCollectionId',
      );
    }
    return config.targetCollectionId;
  }

  private async upsertAssetForItem(
    tx: Prisma.TransactionClient,
    source: KnowledgeSource,
    collectionId: string,
    item: ConnectorFetchedItem,
  ) {
    const checksum =
      item.checksum ?? `${source.id}:${item.externalId ?? item.filename}`;
    const existingAsset = await tx.knowledgeAsset.findFirst({
      where: {
        companyId: source.companyId,
        sourceId: source.id,
        checksum,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingAsset) {
      return tx.knowledgeAsset.update({
        where: { id: existingAsset.id },
        data: {
          filename: item.filename,
          title: item.title ?? item.filename,
          contentType: item.contentType ?? AssetContentType.OTHER,
          status: KnowledgeAssetStatus.UPLOADED,
          mimeType: item.mimeType ?? null,
          sizeBytes:
            item.sizeBytes === undefined ? undefined : BigInt(item.sizeBytes),
          sourceUpdatedAt: item.sourceUpdatedAt,
          storagePath: item.storagePath ?? null,
          checksum,
        },
      });
    }

    const created = await tx.knowledgeAsset.create({
      data: {
        companyId: source.companyId,
        collectionId,
        sourceId: source.id,
        filename: item.filename,
        title: item.title ?? item.filename,
        contentType: item.contentType ?? AssetContentType.OTHER,
        status: KnowledgeAssetStatus.UPLOADED,
        mimeType: item.mimeType ?? null,
        sizeBytes: item.sizeBytes === undefined ? null : BigInt(item.sizeBytes),
        sourceUpdatedAt: item.sourceUpdatedAt,
        storagePath: item.storagePath ?? null,
        checksum,
      },
    });

    await tx.documentMetadata.upsert({
      where: { knowledgeAssetId: created.id },
      create: {
        companyId: source.companyId,
        knowledgeAssetId: created.id,
        metadata: {
          connectorSourceType: source.sourceType,
          externalId: item.externalId ?? null,
          ...item.metadata,
        },
      },
      update: {
        metadata: {
          connectorSourceType: source.sourceType,
          externalId: item.externalId ?? null,
          ...item.metadata,
        },
      },
    });

    return created;
  }
}

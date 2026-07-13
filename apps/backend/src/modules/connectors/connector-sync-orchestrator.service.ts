import { Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeSourceStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ConnectorSyncService } from './connector-sync.service';

@Injectable()
export class ConnectorSyncOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly connectorSyncService: ConnectorSyncService,
  ) {}

  async runSyncNow(sourceId: string, actorUserId: string) {
    const source = await this.prisma.knowledgeSource.findFirst({
      where: {
        id: sourceId,
        deletedAt: null,
        status: KnowledgeSourceStatus.ACTIVE,
        knowledgeBase: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
    });
    if (!source) {
      throw new NotFoundException('Knowledge source not found');
    }

    return this.connectorSyncService.syncSource(source, actorUserId);
  }

  async runScheduledSyncSweep(actorUserId: string) {
    const activeSources = await this.prisma.knowledgeSource.findMany({
      where: {
        deletedAt: null,
        status: KnowledgeSourceStatus.ACTIVE,
        knowledgeBase: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
      orderBy: [{ lastSyncedAt: 'asc' }],
    });

    const results: Array<{
      sourceId: string;
      fetchedCount: number;
      persistedCount: number;
    }> = [];
    for (const source of activeSources) {
      const result = await this.connectorSyncService.syncSource(
        source,
        actorUserId,
      );
      results.push(result);
    }

    return {
      totalSources: activeSources.length,
      syncedSources: results.length,
      results,
    };
  }
}

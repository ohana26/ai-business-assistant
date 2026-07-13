import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { KnowledgeAssetStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AiProvidersService } from '../../ai-providers/ai-providers.service';
import type { StorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { ChunkingService } from './chunking.service';
import { TextExtractionService } from './text-extraction.service';

@Injectable()
export class KnowledgeIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvidersService: AiProvidersService,
    private readonly textExtractionService: TextExtractionService,
    private readonly chunkingService: ChunkingService,
  ) {}

  async ingestUploadedAsset(
    storageProvider: StorageProvider,
    knowledgeAssetId: string,
  ): Promise<void> {
    const asset = await this.prisma.knowledgeAsset.findFirst({
      where: { id: knowledgeAssetId, deletedAt: null },
      select: {
        id: true,
        companyId: true,
        filename: true,
        title: true,
        contentType: true,
        storagePath: true,
        mimeType: true,
      },
    });
    if (!asset || !asset.storagePath) {
      throw new InternalServerErrorException('Knowledge asset was not found');
    }

    const buffer = await storageProvider.download(asset.storagePath);
    const extracted = await this.textExtractionService.extractDocument(
      buffer,
      asset.contentType,
    );
    const chunks = this.chunkingService.chunkText(extracted.text);
    const embeddingProvider = this.aiProvidersService.getEmbeddingProvider();
    const embeddingModel = embeddingProvider.getModelName();

    await this.prisma.$transaction(async (tx) => {
      await tx.documentMetadata.updateMany({
        where: { knowledgeAssetId: asset.id, deletedAt: null },
        data: {
          pageCount: extracted.pageCount ?? null,
        },
      });

      await tx.embedding.deleteMany({
        where: {
          chunk: {
            knowledgeAssetId: asset.id,
          },
        },
      });
      await tx.chunk.deleteMany({
        where: { knowledgeAssetId: asset.id },
      });

      for (const chunk of chunks) {
        const createdChunk = await tx.chunk.create({
          data: {
            companyId: asset.companyId,
            knowledgeAssetId: asset.id,
            chunkIndex: chunk.index,
            content: chunk.content,
            startOffset: chunk.startOffset,
            endOffset: chunk.endOffset,
            tokenCount: this.estimateTokenCount(chunk.content),
            metadata: {
              pageNumber: this.estimatePageNumber(
                chunk.startOffset,
                extracted.pages,
                extracted.pageCount,
                extracted.text.length,
              ),
              section: chunk.section ?? null,
              document: {
                assetId: asset.id,
                filename: asset.filename,
                title: asset.title,
                contentType: asset.contentType,
                mimeType: asset.mimeType,
                pageCount: extracted.pageCount ?? null,
              },
            },
          },
        });

        const vector = await embeddingProvider.createEmbedding(chunk.content);
        const embedding = await tx.embedding.create({
          data: {
            companyId: asset.companyId,
            chunkId: createdChunk.id,
            provider: 'ollama',
            model: embeddingModel,
            dimensions: vector.length,
            vectorVersion: 1,
            values: vector,
          },
        });

        const vectorLiteral = `[${vector.join(',')}]`;
        /**
         * Raw SQL is used here because Prisma does not currently support writing
         * pgvector columns through its model API.
         */
        await tx.$executeRawUnsafe(
          `UPDATE "Embedding" SET "vector" = $1::vector WHERE "id" = $2`,
          vectorLiteral,
          embedding.id,
        );
      }

      await tx.knowledgeAsset.update({
        where: { id: asset.id },
        data: {
          status: KnowledgeAssetStatus.READY,
        },
      });
    });
  }

  private estimateTokenCount(content: string): number {
    return Math.ceil(content.length / 4);
  }

  private estimatePageNumber(
    chunkStartOffset: number,
    pages: Array<{ pageNumber: number; text: string }> | undefined,
    pageCount: number | undefined,
    totalLength: number,
  ): number | undefined {
    if (pages && pages.length > 0) {
      let cursor = 0;
      for (const page of pages) {
        const next = cursor + page.text.length;
        if (chunkStartOffset <= next) {
          return page.pageNumber;
        }
        cursor = next + 1;
      }
      return pages[pages.length - 1]?.pageNumber;
    }

    if (!pageCount || pageCount <= 1 || totalLength <= 0) {
      return pageCount === 1 ? 1 : undefined;
    }

    const ratio = Math.min(1, Math.max(0, chunkStartOffset / totalLength));
    return Math.min(pageCount, Math.max(1, Math.floor(ratio * pageCount) + 1));
  }
}

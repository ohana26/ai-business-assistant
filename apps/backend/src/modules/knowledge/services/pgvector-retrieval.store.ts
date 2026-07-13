import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type {
  RetrievedChunk,
  RetrievalQuery,
  RetrievalStore,
} from './interfaces/retrieval-store.interface';

@Injectable()
export class PgVectorRetrievalStore implements RetrievalStore {
  constructor(private readonly prisma: PrismaService) {}

  async searchSimilarChunks(query: RetrievalQuery): Promise<RetrievedChunk[]> {
    const vectorLiteral = `[${query.queryEmbedding.join(',')}]`;

    /**
     * Raw SQL is used here because Prisma does not yet support pgvector
     * operators (`<=>`) or vector casts (`::vector`) in its query API.
     * Similarity search is executed inside PostgreSQL for scalability.
     */
    const rows = await this.prisma.$queryRawUnsafe<
      Array<{
        chunkId: string;
        chunkContent: string;
        chunkIndex: number;
        assetId: string;
        assetTitle: string;
        similarityScore: number;
      }>
    >(
      `
        SELECT
          c.id AS "chunkId",
          c.content AS "chunkContent",
          c."chunkIndex" AS "chunkIndex",
          ka.id AS "assetId",
          ka.title AS "assetTitle",
          1 - (e.vector <=> $1::vector) AS "similarityScore"
        FROM "Embedding" e
        INNER JOIN "Chunk" c ON c.id = e."chunkId"
        INNER JOIN "KnowledgeAsset" ka ON ka.id = c."knowledgeAssetId"
        INNER JOIN "Collection" col ON col.id = ka."collectionId"
        INNER JOIN "KnowledgeBase" kb ON kb.id = col."knowledgeBaseId"
        WHERE
          e."deletedAt" IS NULL
          AND c."deletedAt" IS NULL
          AND ka."deletedAt" IS NULL
          AND col."deletedAt" IS NULL
          AND kb."deletedAt" IS NULL
          AND e."companyId" = $2::uuid
          AND kb."workspaceId" = $3::uuid
          AND e.model = $4
          AND e.vector IS NOT NULL
        ORDER BY e.vector <=> $1::vector ASC
        LIMIT $5
      `,
      vectorLiteral,
      query.companyId,
      query.workspaceId,
      query.embeddingModel,
      query.topK,
    );

    return rows;
  }
}

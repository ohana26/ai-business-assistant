import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvidersService } from '../../ai-providers/ai-providers.service';
import type {
  RetrievedChunk,
  RetrievalStore,
} from './interfaces/retrieval-store.interface';

export const RETRIEVAL_STORE_TOKEN = 'RETRIEVAL_STORE_TOKEN';

@Injectable()
export class RetrievalService {
  private readonly topK: number;
  private readonly minSimilarityScore: number;

  constructor(
    @Inject(RETRIEVAL_STORE_TOKEN)
    private readonly retrievalStore: RetrievalStore,
    private readonly aiProvidersService: AiProvidersService,
    private readonly configService: ConfigService,
  ) {
    this.topK = Math.max(
      1,
      this.configService.get<number>('app.retrievalTopK', 5),
    );
    this.minSimilarityScore = Math.min(
      1,
      Math.max(0, this.configService.get<number>('app.minSimilarityScore', 0)),
    );
  }

  async retrieveRelevantChunks(
    companyId: string,
    workspaceId: string,
    question: string,
  ): Promise<RetrievedChunk[]> {
    const embeddingProvider = this.aiProvidersService.getEmbeddingProvider();
    const queryEmbedding = await embeddingProvider.createEmbedding(question);

    const rows = await this.retrievalStore.searchSimilarChunks({
      companyId,
      workspaceId,
      queryEmbedding,
      topK: this.topK,
      embeddingModel: embeddingProvider.getModelName(),
    });
    return rows.filter(
      (chunk) => chunk.similarityScore >= this.minSimilarityScore,
    );
  }

  getSettings() {
    return {
      topK: this.topK,
      minSimilarityScore: this.minSimilarityScore,
    };
  }
}

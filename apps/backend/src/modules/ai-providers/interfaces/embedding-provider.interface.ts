export interface EmbeddingProvider {
  createEmbedding(input: string): Promise<number[]>;
  getModelName(): string;
}

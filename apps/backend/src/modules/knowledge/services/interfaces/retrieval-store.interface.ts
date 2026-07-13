export type RetrievedChunk = {
  chunkId: string;
  chunkContent: string;
  chunkIndex: number;
  assetId: string;
  assetTitle: string;
  similarityScore: number;
};

export type RetrievalQuery = {
  companyId: string;
  workspaceId: string;
  queryEmbedding: number[];
  topK: number;
  embeddingModel: string;
};

export interface RetrievalStore {
  searchSimilarChunks(query: RetrievalQuery): Promise<RetrievedChunk[]>;
}

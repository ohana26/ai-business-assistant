export type RetrievedChunk = {
  chunkId: string;
  chunkContent: string;
  chunkIndex: number;
  chunkMetadata?: {
    pageNumber?: number;
    section?: string;
    document?: {
      assetId: string;
      filename: string;
      title: string;
      contentType?: string;
    };
  };
  assetId: string;
  assetTitle: string;
  assetFilename: string;
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

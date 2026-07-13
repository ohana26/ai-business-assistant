-- Ensure pgvector extension exists for vector column operations
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Embedding" ADD COLUMN "vector" vector(768);

-- Vector similarity index (cosine) used by RetrievalService top-k search
CREATE INDEX "Embedding_vector_cosine_idx"
ON "Embedding"
USING ivfflat ("vector" vector_cosine_ops)
WITH (lists = 100);

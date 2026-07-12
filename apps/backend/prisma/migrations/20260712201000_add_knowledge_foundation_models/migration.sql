-- CreateEnum
CREATE TYPE "KnowledgeBaseStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('FILE_UPLOAD', 'GOOGLE_DRIVE', 'ONEDRIVE', 'EMAIL', 'SLACK', 'DATABASE', 'API', 'WEB', 'MANUAL');

-- CreateEnum
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "KnowledgeAssetStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetContentType" AS ENUM ('PDF', 'DOCX', 'TXT', 'MARKDOWN', 'HTML', 'CSV', 'JSON', 'EMAIL_MESSAGE', 'SLACK_MESSAGE', 'DB_ROW', 'API_RECORD', 'OTHER');

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "KnowledgeBaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "knowledgeBaseId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "CollectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "knowledgeBaseId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "KnowledgeSourceType" NOT NULL,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "connectorConfig" JSONB,
    "syncState" JSONB,
    "externalReference" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeAsset" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "sourceId" UUID,
    "title" TEXT NOT NULL,
    "contentType" "AssetContentType" NOT NULL,
    "status" "KnowledgeAssetStatus" NOT NULL DEFAULT 'PENDING',
    "mimeType" TEXT,
    "language" TEXT,
    "checksum" TEXT,
    "storagePath" TEXT,
    "sizeBytes" BIGINT,
    "sourceUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentMetadata" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "knowledgeAssetId" UUID NOT NULL,
    "author" TEXT,
    "sourceCreatedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),
    "pageCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "knowledgeAssetId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "startOffset" INTEGER,
    "endOffset" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embedding" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "chunkId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "vectorVersion" INTEGER NOT NULL DEFAULT 1,
    "values" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeBase_companyId_workspaceId_status_idx" ON "KnowledgeBase"("companyId", "workspaceId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeBase_workspaceId_status_idx" ON "KnowledgeBase"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeBase_deletedAt_idx" ON "KnowledgeBase"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBase_companyId_workspaceId_slug_key" ON "KnowledgeBase"("companyId", "workspaceId", "slug");

-- CreateIndex
CREATE INDEX "Collection_companyId_knowledgeBaseId_status_idx" ON "Collection"("companyId", "knowledgeBaseId", "status");

-- CreateIndex
CREATE INDEX "Collection_deletedAt_idx" ON "Collection"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_knowledgeBaseId_slug_key" ON "Collection"("knowledgeBaseId", "slug");

-- CreateIndex
CREATE INDEX "KnowledgeSource_companyId_knowledgeBaseId_status_idx" ON "KnowledgeSource"("companyId", "knowledgeBaseId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeSource_sourceType_status_idx" ON "KnowledgeSource"("sourceType", "status");

-- CreateIndex
CREATE INDEX "KnowledgeSource_externalReference_idx" ON "KnowledgeSource"("externalReference");

-- CreateIndex
CREATE INDEX "KnowledgeSource_deletedAt_idx" ON "KnowledgeSource"("deletedAt");

-- CreateIndex
CREATE INDEX "KnowledgeAsset_companyId_collectionId_status_idx" ON "KnowledgeAsset"("companyId", "collectionId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeAsset_sourceId_status_idx" ON "KnowledgeAsset"("sourceId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeAsset_checksum_idx" ON "KnowledgeAsset"("checksum");

-- CreateIndex
CREATE INDEX "KnowledgeAsset_deletedAt_idx" ON "KnowledgeAsset"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentMetadata_knowledgeAssetId_key" ON "DocumentMetadata"("knowledgeAssetId");

-- CreateIndex
CREATE INDEX "DocumentMetadata_companyId_idx" ON "DocumentMetadata"("companyId");

-- CreateIndex
CREATE INDEX "DocumentMetadata_deletedAt_idx" ON "DocumentMetadata"("deletedAt");

-- CreateIndex
CREATE INDEX "Chunk_companyId_knowledgeAssetId_idx" ON "Chunk"("companyId", "knowledgeAssetId");

-- CreateIndex
CREATE INDEX "Chunk_knowledgeAssetId_deletedAt_idx" ON "Chunk"("knowledgeAssetId", "deletedAt");

-- CreateIndex
CREATE INDEX "Chunk_deletedAt_idx" ON "Chunk"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Chunk_knowledgeAssetId_chunkIndex_key" ON "Chunk"("knowledgeAssetId", "chunkIndex");

-- CreateIndex
CREATE INDEX "Embedding_companyId_provider_model_idx" ON "Embedding"("companyId", "provider", "model");

-- CreateIndex
CREATE INDEX "Embedding_chunkId_idx" ON "Embedding"("chunkId");

-- CreateIndex
CREATE INDEX "Embedding_deletedAt_idx" ON "Embedding"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Embedding_chunkId_provider_model_vectorVersion_key" ON "Embedding"("chunkId", "provider", "model", "vectorVersion");

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAsset" ADD CONSTRAINT "KnowledgeAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAsset" ADD CONSTRAINT "KnowledgeAsset_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAsset" ADD CONSTRAINT "KnowledgeAsset_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentMetadata" ADD CONSTRAINT "DocumentMetadata_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentMetadata" ADD CONSTRAINT "DocumentMetadata_knowledgeAssetId_fkey" FOREIGN KEY ("knowledgeAssetId") REFERENCES "KnowledgeAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_knowledgeAssetId_fkey" FOREIGN KEY ("knowledgeAssetId") REFERENCES "KnowledgeAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "Chunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

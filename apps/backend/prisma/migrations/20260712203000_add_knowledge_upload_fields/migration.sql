-- AlterEnum
ALTER TYPE "KnowledgeAssetStatus" ADD VALUE 'UPLOADED';

-- AlterTable
ALTER TABLE "KnowledgeAsset" ADD COLUMN "filename" TEXT;
UPDATE "KnowledgeAsset"
SET "filename" = COALESCE("title", 'document')
WHERE "filename" IS NULL;
ALTER TABLE "KnowledgeAsset" ALTER COLUMN "filename" SET NOT NULL;

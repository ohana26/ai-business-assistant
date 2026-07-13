import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { StorageModule } from '../storage/storage.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { ChunkingService } from './services/chunking.service';
import { KnowledgeIngestionService } from './services/knowledge-ingestion.service';
import { PgVectorRetrievalStore } from './services/pgvector-retrieval.store';
import {
  RETRIEVAL_STORE_TOKEN,
  RetrievalService,
} from './services/retrieval.service';
import { TextExtractionService } from './services/text-extraction.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AuditModule,
    StorageModule,
    AiProvidersModule,
  ],
  controllers: [KnowledgeController],
  providers: [
    KnowledgeService,
    TextExtractionService,
    ChunkingService,
    KnowledgeIngestionService,
    RetrievalService,
    PgVectorRetrievalStore,
    {
      provide: RETRIEVAL_STORE_TOKEN,
      useExisting: PgVectorRetrievalStore,
    },
  ],
  exports: [RetrievalService],
})
export class KnowledgeModule {}

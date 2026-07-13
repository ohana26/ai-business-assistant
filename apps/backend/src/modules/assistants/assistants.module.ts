import { Module } from '@nestjs/common';
import { AssistantsController } from './assistants.controller';
import { AssistantsService } from './assistants.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { PromptBuilderService } from './services/prompt-builder.service';
import { MemoryService } from './services/memory.service';
import { ConversationContextService } from './services/conversation-context.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AuditModule,
    AiProvidersModule,
    KnowledgeModule,
  ],
  controllers: [AssistantsController],
  providers: [
    AssistantsService,
    PromptBuilderService,
    MemoryService,
    ConversationContextService,
  ],
})
export class AssistantsModule {}

import { Module } from '@nestjs/common';
import { AssistantsController } from './assistants.controller';
import { AssistantsService } from './assistants.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { AssistantBrainModule } from '../assistant-brain/assistant-brain.module';
import { MemoryService } from './services/memory.service';
import { ConversationContextService } from './services/conversation-context.service';

@Module({
  imports: [AuthModule, DatabaseModule, AuditModule, AssistantBrainModule],
  controllers: [AssistantsController],
  providers: [AssistantsService, MemoryService, ConversationContextService],
})
export class AssistantsModule {}

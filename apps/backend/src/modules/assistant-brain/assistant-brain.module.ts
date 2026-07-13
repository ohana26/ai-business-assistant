import { Module } from '@nestjs/common';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { PromptBuilderService } from '../assistants/services/prompt-builder.service';
import { AssistantBrainService } from './assistant-brain.service';
import { IntentRouterService } from './services/intent-router.service';
import { ToolPlannerService } from './services/tool-planner.service';

@Module({
  imports: [KnowledgeModule, AiProvidersModule],
  providers: [
    AssistantBrainService,
    IntentRouterService,
    ToolPlannerService,
    PromptBuilderService,
  ],
  exports: [AssistantBrainService, IntentRouterService, ToolPlannerService],
})
export class AssistantBrainModule {}

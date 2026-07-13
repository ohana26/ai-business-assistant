import { Module } from '@nestjs/common';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { AuditModule } from '../audit/audit.module';
import { PromptBuilderService } from '../assistants/services/prompt-builder.service';
import { AssistantBrainService } from './assistant-brain.service';
import { IntentRouterService } from './services/intent-router.service';
import { ToolPlannerService } from './services/tool-planner.service';
import {
  ToolRegistryService,
  ASSISTANT_BRAIN_TOOLS,
} from './services/tool-registry.service';
import { ExecutionEngineService } from './services/execution-engine.service';
import { CalendarTool } from './tools/calendar.tool';

@Module({
  imports: [KnowledgeModule, AiProvidersModule, AuditModule],
  providers: [
    AssistantBrainService,
    IntentRouterService,
    ToolPlannerService,
    ToolRegistryService,
    ExecutionEngineService,
    CalendarTool,
    {
      provide: ASSISTANT_BRAIN_TOOLS,
      useFactory: (calendarTool: CalendarTool) => [calendarTool],
      inject: [CalendarTool],
    },
    PromptBuilderService,
  ],
  exports: [
    AssistantBrainService,
    IntentRouterService,
    ToolPlannerService,
    ToolRegistryService,
    ExecutionEngineService,
  ],
})
export class AssistantBrainModule {}

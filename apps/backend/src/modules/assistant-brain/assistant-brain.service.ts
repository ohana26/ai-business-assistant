import { Injectable } from '@nestjs/common';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { RetrievalService } from '../knowledge/services/retrieval.service';
import { PromptBuilderService } from '../assistants/services/prompt-builder.service';
import { AssistantIntent } from './assistant-intent.enum';
import { IntentRouterService } from './services/intent-router.service';
import { ToolPlannerService } from './services/tool-planner.service';
import { ExecutionEngineService } from './services/execution-engine.service';
import type { ToolExecutionPlan } from './interfaces/tool-execution-plan.interface';
import type { ToolExecutionResult } from './interfaces/tool-execution-result.interface';

export interface AssistantBrainResult {
  intent: AssistantIntent;
  answer: string;
  toolPlan: ToolExecutionPlan | null;
  toolExecution: ToolExecutionResult | null;
  modelName: string | null;
  retrievalLatency: number;
  generationLatency: number;
  promptCharacterCount: number;
  promptEstimatedTokens: number;
  retrievalError: string | null;
  retrievalSettings: ReturnType<RetrievalService['getSettings']>;
  documentsUsed: Array<{
    assetId: string;
    filename: string;
    title: string | null;
  }>;
  sources: Array<{
    chunkId: string;
    assetId: string;
    filename: string;
    title: string | null;
    similarityScore: number;
    pageNumber?: number;
    section?: string;
  }>;
  retrievedChunks: Awaited<
    ReturnType<RetrievalService['retrieveRelevantChunks']>
  >;
}

@Injectable()
export class AssistantBrainService {
  constructor(
    private readonly intentRouterService: IntentRouterService,
    private readonly toolPlannerService: ToolPlannerService,
    private readonly retrievalService: RetrievalService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly aiProvidersService: AiProvidersService,
    private readonly executionEngineService: ExecutionEngineService,
  ) {}

  async orchestrate(params: {
    companyId: string;
    workspaceId: string;
    userMessage: string;
    conversationSummary: string | null;
    conversationFacts: Array<{
      fact: string;
      importance: 'LOW' | 'MEDIUM' | 'HIGH';
      createdAt: string;
    }>;
    recentMessages: Array<{
      role: 'USER' | 'ASSISTANT' | 'SYSTEM';
      content: string;
    }>;
    conversationHistory: Array<{
      role: 'USER' | 'ASSISTANT' | 'SYSTEM';
      content: string;
    }>;
    userMemories: Array<{
      type: string;
      content: string;
      importance: number;
      createdAt: string;
    }>;
    assistantProfile: {
      id: string;
      name: string;
      systemPrompt: string;
      behaviorConfig: unknown;
      personalPrompt: string | null;
      preferences: unknown;
    };
    userId: string;
    conversationId: string;
  }): Promise<AssistantBrainResult> {
    const intent = this.intentRouterService.classify({
      message: params.userMessage,
      conversationSummary: params.conversationSummary,
      recentMessages: params.recentMessages,
    });

    const retrievalSettings = this.retrievalService.getSettings();
    let retrievalError: string | null = null;
    let retrievalLatency = 0;
    let generationLatency = 0;
    let promptCharacterCount = 0;
    let promptEstimatedTokens = 0;
    let modelName: string | null = null;
    let toolPlan: ToolExecutionPlan | null = null;
    let toolExecution: ToolExecutionResult | null = null;
    let retrievedChunks = [] as Awaited<
      ReturnType<RetrievalService['retrieveRelevantChunks']>
    >;
    let answer = '';

    if (
      intent === AssistantIntent.KNOWLEDGE ||
      intent === AssistantIntent.MIXED
    ) {
      const retrievalStartedAt = Date.now();
      try {
        retrievedChunks = await this.retrievalService.retrieveRelevantChunks(
          params.companyId,
          params.workspaceId,
          params.userMessage,
        );
      } catch (error) {
        retrievalError =
          error instanceof Error ? error.message : 'Unknown retrieval error';
      }
      retrievalLatency = Date.now() - retrievalStartedAt;
    }

    if (intent === AssistantIntent.ACTION || intent === AssistantIntent.MIXED) {
      toolPlan = this.toolPlannerService.buildPlan({
        message: params.userMessage,
      });
    }

    if (intent === AssistantIntent.ACTION && toolPlan) {
      toolExecution = await this.executionEngineService.executePlan({
        plan: toolPlan,
        companyId: params.companyId,
        userId: params.userId,
        conversationId: params.conversationId,
        confirmedByUser: !toolPlan.requiresUserConfirmation,
      });
    }

    if (intent !== AssistantIntent.ACTION) {
      const prompt = this.promptBuilderService.buildPrompt({
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        userMessage: params.userMessage,
        chunks: retrievedChunks,
        conversationHistory: params.conversationHistory,
        conversationSummary: params.conversationSummary,
        conversationFacts: params.conversationFacts,
        recentMessages: params.recentMessages,
        userMemories: params.userMemories,
        assistantProfile: {
          name: params.assistantProfile.name,
          systemPrompt: params.assistantProfile.systemPrompt,
          behaviorConfig: params.assistantProfile.behaviorConfig,
          personalPrompt: params.assistantProfile.personalPrompt,
          preferences: params.assistantProfile.preferences,
        },
      });
      promptCharacterCount = prompt.length;
      promptEstimatedTokens = Math.ceil(promptCharacterCount / 4);
      const chatProvider = this.aiProvidersService.getChatProvider();
      const generationStartedAt = Date.now();
      answer = await chatProvider.generateResponse(prompt);
      generationLatency = Date.now() - generationStartedAt;
      modelName = chatProvider.getModelName();
    } else {
      answer = this.buildActionExecutionMessage(toolPlan, toolExecution);
    }

    const documentsUsed = Array.from(
      new Map(
        retrievedChunks.map((chunk) => [
          chunk.assetId,
          {
            assetId: chunk.assetId,
            filename: chunk.assetFilename,
            title: chunk.assetTitle,
          },
        ]),
      ).values(),
    );

    return {
      intent,
      answer,
      toolPlan,
      toolExecution,
      modelName,
      retrievalLatency,
      generationLatency,
      promptCharacterCount,
      promptEstimatedTokens,
      retrievalError,
      retrievalSettings,
      documentsUsed,
      retrievedChunks,
      sources: retrievedChunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        assetId: chunk.assetId,
        filename: chunk.assetFilename,
        title: chunk.assetTitle,
        similarityScore: chunk.similarityScore,
        pageNumber: chunk.chunkMetadata?.pageNumber,
        section: chunk.chunkMetadata?.section,
      })),
    };
  }

  private buildActionExecutionMessage(
    toolPlan: ToolExecutionPlan | null,
    toolExecution: ToolExecutionResult | null,
  ) {
    if (!toolPlan) {
      return 'I identified this as an action request, but I could not construct a valid execution plan yet.';
    }

    if (!toolExecution) {
      return `I prepared a tool execution plan for "${toolPlan.toolName}", but it has not been executed yet.`;
    }

    if (!toolExecution.success) {
      return `I prepared an execution request for "${toolPlan.toolName}", but it did not complete. Reason: ${toolExecution.message}.`;
    }

    return `Execution completed via "${toolPlan.toolName}". Result: ${toolExecution.message}.`;
  }
}

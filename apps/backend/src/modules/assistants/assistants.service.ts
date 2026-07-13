import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MembershipStatus,
  MessageRole,
  Prisma,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CurrentUserContext } from '../auth/types/current-user-context.type';
import { MemoryService } from './services/memory.service';
import { ConversationContextService } from './services/conversation-context.service';
import { AssistantBrainService } from '../assistant-brain/assistant-brain.service';

@Injectable()
export class AssistantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assistantBrainService: AssistantBrainService,
    private readonly auditService: AuditService,
    private readonly memoryService: MemoryService,
    private readonly conversationContextService: ConversationContextService,
  ) {}

  async listConversations(params: {
    userContext: CurrentUserContext;
    companyId?: string;
    workspaceId?: string;
  }) {
    const { companyId, workspaceId } = await this.assertWorkspaceAccess(
      params.userContext,
      params.companyId,
      params.workspaceId,
    );

    const conversations = await this.prisma.conversation.findMany({
      where: {
        companyId,
        workspaceId,
        userId: params.userContext.userId,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      items: conversations.map((conversation) => ({
        id: conversation.id,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessage: conversation.messages[0]
          ? {
              id: conversation.messages[0].id,
              role: conversation.messages[0].role,
              content: conversation.messages[0].content,
              createdAt: conversation.messages[0].createdAt.toISOString(),
            }
          : null,
      })),
    };
  }

  async listConversationMessages(params: {
    userContext: CurrentUserContext;
    companyId?: string;
    workspaceId?: string;
    conversationId: string;
  }) {
    const { companyId, workspaceId } = await this.assertWorkspaceAccess(
      params.userContext,
      params.companyId,
      params.workspaceId,
    );

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        companyId,
        workspaceId,
        userId: params.userContext.userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!conversation) {
      throw new ForbiddenException(
        'Conversation is not accessible in the requested workspace',
      );
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
        companyId,
        workspaceId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return {
      conversationId: params.conversationId,
      items: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  }

  async chat(params: {
    userContext: CurrentUserContext;
    companyId?: string;
    workspaceId?: string;
    message: string;
    conversationId?: string;
    debug?: boolean;
  }) {
    const { companyId, workspaceId } = await this.assertWorkspaceAccess(
      params.userContext,
      params.companyId,
      params.workspaceId,
    );

    const conversation = params.conversationId
      ? await this.prisma.conversation.findFirst({
          where: {
            id: params.conversationId,
            companyId,
            workspaceId,
            userId: params.userContext.userId,
            deletedAt: null,
          },
          select: { id: true },
        })
      : await this.prisma.conversation.create({
          data: {
            companyId,
            workspaceId,
            userId: params.userContext.userId,
          },
          select: { id: true },
        });
    if (!conversation) {
      throw new ForbiddenException(
        'Conversation is not accessible in the requested workspace',
      );
    }
    if (!params.conversationId) {
      await this.auditService.log({
        companyId,
        userId: params.userContext.userId,
        action: 'assistant.conversation.created',
        resourceType: 'assistant.conversation',
        resourceId: conversation.id,
        metadata: {
          workspaceId,
        },
      });
    }

    const userMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        companyId,
        workspaceId,
        userId: params.userContext.userId,
        role: MessageRole.USER,
        content: params.message,
      },
      select: { id: true, role: true },
    });
    await this.auditService.log({
      companyId,
      userId: params.userContext.userId,
      action: 'assistant.message.created',
      resourceType: 'assistant.message',
      resourceId: userMessage.id,
      metadata: {
        workspaceId,
        conversationId: conversation.id,
        role: userMessage.role,
      },
    });

    await this.conversationContextService.extractAndStoreFactsFromUserMessage({
      conversationId: conversation.id,
      companyId,
      userId: params.userContext.userId,
      message: params.message,
    });

    const conversationContext =
      await this.conversationContextService.loadContext({
        conversationId: conversation.id,
        companyId,
        workspaceId,
      });
    const memoryContext = await this.memoryService.getMemoryContext({
      userId: params.userContext.userId,
      companyId,
      message: params.message,
    });

    const startedAt = Date.now();
    const brainResult = await this.assistantBrainService.orchestrate({
      companyId,
      workspaceId,
      userMessage: params.message,
      conversationHistory: conversationContext.recentMessages.map(
        (message) => ({
          role: message.role,
          content: message.content,
        }),
      ),
      conversationSummary: conversationContext.summary,
      conversationFacts: conversationContext.importantFacts.map((fact) => ({
        fact: fact.fact,
        importance: fact.importance,
        createdAt: fact.createdAt,
      })),
      recentMessages: conversationContext.recentMessages,
      userMemories: memoryContext.memories,
      assistantProfile: memoryContext.assistantProfile,
    });
    const latency = Date.now() - startedAt;

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        companyId,
        workspaceId,
        userId: params.userContext.userId,
        role: MessageRole.ASSISTANT,
        content: brainResult.answer,
      },
      select: { id: true, role: true },
    });
    await this.auditService.log({
      companyId,
      userId: params.userContext.userId,
      action: 'assistant.message.created',
      resourceType: 'assistant.message',
      resourceId: assistantMessage.id,
      metadata: {
        workspaceId,
        conversationId: conversation.id,
        role: assistantMessage.role,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    await this.conversationContextService.refreshSummary({
      conversationId: conversation.id,
      companyId,
      workspaceId,
    });

    await this.auditService.log({
      companyId,
      userId: params.userContext.userId,
      action: 'assistant.chat',
      resourceType: 'assistant.chat',
      metadata: {
        userId: params.userContext.userId,
        companyId,
        workspaceId,
        intent: brainResult.intent,
        model: brainResult.modelName,
        latency,
        retrievalLatency: brainResult.retrievalLatency,
        generationLatency: brainResult.generationLatency,
        promptCharacterCount: brainResult.promptCharacterCount,
        promptEstimatedTokens: brainResult.promptEstimatedTokens,
        retrievalSettings: brainResult.retrievalSettings,
        documentsUsed: brainResult.documentsUsed,
        conversationSummary: conversationContext.summary,
        conversationFactCount: conversationContext.importantFacts.length,
        memoryCount: memoryContext.memories.length,
        assistantProfileId: memoryContext.assistantProfile.id,
        retrievalError: brainResult.retrievalError,
        toolPlan: brainResult.toolPlan
          ? {
              toolName: brainResult.toolPlan.toolName,
              reason: brainResult.toolPlan.reason,
              confidence: brainResult.toolPlan.confidence,
              parameters: brainResult.toolPlan.parameters,
              missingInformation: brainResult.toolPlan.missingInformation,
              requiresUserConfirmation:
                brainResult.toolPlan.requiresUserConfirmation,
            }
          : null,
        retrievedChunks: brainResult.retrievedChunks.map((chunk) => ({
          chunkId: chunk.chunkId,
          assetId: chunk.assetId,
          score: chunk.similarityScore,
          pageNumber: chunk.chunkMetadata?.pageNumber,
          section: chunk.chunkMetadata?.section,
        })),
      },
    });

    const response = {
      conversationId: conversation.id,
      intent: brainResult.intent,
      answer: brainResult.answer,
      toolPlan: brainResult.toolPlan,
      sources: brainResult.sources,
    };

    await this.memoryService.captureMemoryFromUserMessage({
      userId: params.userContext.userId,
      companyId,
      message: params.message,
    });
    if (!params.debug) {
      return response;
    }

    return {
      ...response,
      debug: {
        retrievalSettings: brainResult.retrievalSettings,
        intent: brainResult.intent,
        toolPlan: brainResult.toolPlan,
        memory: {
          count: memoryContext.memories.length,
          assistantProfileId: memoryContext.assistantProfile.id,
          assistantProfileName: memoryContext.assistantProfile.name,
          items: memoryContext.memories,
        },
        conversation: {
          summary: conversationContext.summary,
          importantFacts: conversationContext.importantFacts,
          recentMessages: conversationContext.recentMessages,
        },
        prompt: {
          characterCount: brainResult.promptCharacterCount,
          estimatedTokens: brainResult.promptEstimatedTokens,
        },
        latency: {
          totalMs: latency,
          retrievalMs: brainResult.retrievalLatency,
          generationMs: brainResult.generationLatency,
        },
        documentsUsed: brainResult.documentsUsed,
        retrievedChunks: brainResult.retrievedChunks.map((chunk) => ({
          chunkId: chunk.chunkId,
          chunkIndex: chunk.chunkIndex,
          assetId: chunk.assetId,
          filename: chunk.assetFilename,
          title: chunk.assetTitle,
          similarityScore: chunk.similarityScore,
          metadata: chunk.chunkMetadata ?? null,
          content: chunk.chunkContent,
        })),
        retrievalError: brainResult.retrievalError,
      },
    };
  }

  async listMemories(params: {
    userContext: CurrentUserContext;
    companyId?: string;
  }) {
    const { companyId } = await this.assertCompanyAccess(
      params.userContext,
      params.companyId,
    );

    return this.memoryService.listUserMemories({
      userId: params.userContext.userId,
      companyId,
    });
  }

  async deleteMemory(params: {
    userContext: CurrentUserContext;
    companyId?: string;
    memoryId: string;
  }) {
    const { companyId } = await this.assertCompanyAccess(
      params.userContext,
      params.companyId,
    );
    const result = await this.memoryService.deleteUserMemory({
      userId: params.userContext.userId,
      companyId,
      memoryId: params.memoryId,
    });
    if (!result.deleted) {
      throw new NotFoundException('Memory was not found');
    }

    return result;
  }

  async listAssistantProfiles(params: {
    userContext: CurrentUserContext;
    companyId?: string;
  }) {
    const { companyId } = await this.assertCompanyAccess(
      params.userContext,
      params.companyId,
    );
    return this.memoryService.listAssistantProfiles({ companyId });
  }

  async updateAssistantProfile(params: {
    userContext: CurrentUserContext;
    companyId?: string;
    profileId: string;
    name?: string;
    systemPrompt?: string;
    behaviorConfig?: unknown;
  }) {
    const { companyId } = await this.assertCompanyAccess(
      params.userContext,
      params.companyId,
    );
    const updated = await this.memoryService.updateAssistantProfile({
      profileId: params.profileId,
      companyId,
      actorUserId: params.userContext.userId,
      name: params.name,
      systemPrompt: params.systemPrompt,
      behaviorConfig: params.behaviorConfig as
        Prisma.InputJsonValue | undefined,
    });
    if (!updated) {
      throw new NotFoundException('Assistant profile was not found');
    }
    return updated;
  }

  private async assertWorkspaceAccess(
    userContext: CurrentUserContext,
    companyId: string | undefined,
    workspaceId: string | undefined,
  ) {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
    if (!workspaceId) {
      throw new BadRequestException('x-workspace-id header is required');
    }

    const companyAccess = userContext.companies.find(
      (company) => company.companyId === companyId,
    );
    if (!companyAccess) {
      throw new ForbiddenException(
        'User is not a member of the provided company',
      );
    }

    const [user, workspaceMembership] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: userContext.userId,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        select: { id: true },
      }),
      this.prisma.workspaceMembership.findFirst({
        where: {
          membershipId: companyAccess.membershipId,
          workspaceId,
          deletedAt: null,
          membership: {
            status: MembershipStatus.ACTIVE,
            deletedAt: null,
          },
          workspace: {
            companyId,
            status: 'ACTIVE',
            deletedAt: null,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!user) {
      throw new ForbiddenException('User is not active');
    }
    if (!workspaceMembership) {
      throw new ForbiddenException(
        'User does not have active access to the requested workspace',
      );
    }

    return { companyId, workspaceId };
  }

  private async assertCompanyAccess(
    userContext: CurrentUserContext,
    companyId: string | undefined,
  ) {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }

    const companyAccess = userContext.companies.find(
      (company) => company.companyId === companyId,
    );
    if (!companyAccess) {
      throw new ForbiddenException(
        'User is not a member of the provided company',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userContext.userId,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!user) {
      throw new ForbiddenException('User is not active');
    }

    return { companyId };
  }
}

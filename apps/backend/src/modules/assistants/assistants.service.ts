import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MembershipStatus, MessageRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CurrentUserContext } from '../auth/types/current-user-context.type';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { RetrievalService } from '../knowledge/services/retrieval.service';
import { PromptBuilderService } from './services/prompt-builder.service';

@Injectable()
export class AssistantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrievalService: RetrievalService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly aiProvidersService: AiProvidersService,
    private readonly auditService: AuditService,
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

    const conversationHistory = await this.prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        companyId,
        workspaceId,
        deletedAt: null,
        role: { in: [MessageRole.USER, MessageRole.ASSISTANT] },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        role: true,
        content: true,
      },
    });

    const startedAt = Date.now();
    let retrievedChunks = [] as Awaited<
      ReturnType<RetrievalService['retrieveRelevantChunks']>
    >;
    let retrievalError: string | null = null;
    try {
      retrievedChunks = await this.retrievalService.retrieveRelevantChunks(
        companyId,
        workspaceId,
        params.message,
      );
    } catch (error) {
      retrievalError =
        error instanceof Error ? error.message : 'Unknown retrieval error';
    }
    const prompt = this.promptBuilderService.buildPrompt({
      companyId,
      workspaceId,
      userMessage: params.message,
      chunks: retrievedChunks,
      conversationHistory: conversationHistory
        .reverse()
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    });
    const chatProvider = this.aiProvidersService.getChatProvider();
    const answer = await chatProvider.generateResponse(prompt);
    const latency = Date.now() - startedAt;

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        companyId,
        workspaceId,
        userId: params.userContext.userId,
        role: MessageRole.ASSISTANT,
        content: answer,
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

    await this.auditService.log({
      companyId,
      userId: params.userContext.userId,
      action: 'assistant.chat',
      resourceType: 'assistant.chat',
      metadata: {
        userId: params.userContext.userId,
        companyId,
        workspaceId,
        model: chatProvider.getModelName(),
        latency,
        retrievalError,
        retrievedChunks: retrievedChunks.map((chunk) => ({
          chunkId: chunk.chunkId,
          assetId: chunk.assetId,
          score: chunk.similarityScore,
        })),
      },
    });

    return {
      conversationId: conversation.id,
      answer,
      sources: retrievedChunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        assetId: chunk.assetId,
        filename: chunk.assetFilename,
        title: chunk.assetTitle,
        similarityScore: chunk.similarityScore,
      })),
    };
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
}

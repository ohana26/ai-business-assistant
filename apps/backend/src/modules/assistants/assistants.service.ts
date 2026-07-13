import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MembershipStatus, UserStatus } from '@prisma/client';
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

  async chat(params: {
    userContext: CurrentUserContext;
    companyId?: string;
    workspaceId?: string;
    message: string;
  }) {
    if (!params.companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
    if (!params.workspaceId) {
      throw new BadRequestException('x-workspace-id header is required');
    }

    const companyAccess = params.userContext.companies.find(
      (company) => company.companyId === params.companyId,
    );
    if (!companyAccess) {
      throw new ForbiddenException(
        'User is not a member of the provided company',
      );
    }

    const [user, workspaceMembership] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: params.userContext.userId,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        select: { id: true },
      }),
      this.prisma.workspaceMembership.findFirst({
        where: {
          membershipId: companyAccess.membershipId,
          workspaceId: params.workspaceId,
          deletedAt: null,
          membership: {
            status: MembershipStatus.ACTIVE,
            deletedAt: null,
          },
          workspace: {
            companyId: params.companyId,
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

    const startedAt = Date.now();
    const retrievedChunks = await this.retrievalService.retrieveRelevantChunks(
      params.companyId,
      params.workspaceId,
      params.message,
    );
    const prompt = this.promptBuilderService.buildPrompt({
      companyId: params.companyId,
      workspaceId: params.workspaceId,
      userMessage: params.message,
      chunks: retrievedChunks,
    });
    const chatProvider = this.aiProvidersService.getChatProvider();
    const answer = await chatProvider.generateResponse(prompt);
    const latency = Date.now() - startedAt;

    await this.auditService.log({
      companyId: params.companyId,
      userId: params.userContext.userId,
      action: 'assistant.chat',
      resourceType: 'assistant.chat',
      metadata: {
        userId: params.userContext.userId,
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        model: chatProvider.getModelName(),
        latency,
        retrievedChunks: retrievedChunks.map((chunk) => ({
          chunkId: chunk.chunkId,
          assetId: chunk.assetId,
          score: chunk.similarityScore,
        })),
      },
    });

    return { answer };
  }
}

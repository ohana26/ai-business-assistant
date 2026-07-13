import { Injectable } from '@nestjs/common';
import type {
  AssistantProfile,
  Prisma,
  UserAssistantProfile,
  UserMemory,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/audit.service';

type MemoryContext = {
  assistantProfile: {
    id: string;
    name: string;
    systemPrompt: string;
    behaviorConfig: Prisma.JsonValue | null;
    personalPrompt: string | null;
    preferences: Prisma.JsonValue | null;
  };
  memories: Array<{
    id: string;
    type: string;
    content: string;
    importance: number;
    createdAt: string;
  }>;
};

@Injectable()
export class MemoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async storeMemory(params: {
    userId: string;
    companyId: string;
    type: string;
    content: string;
    importance: number;
  }) {
    const memory = await this.prisma.userMemory.create({
      data: {
        userId: params.userId,
        companyId: params.companyId,
        type: params.type,
        content: params.content,
        importance: Math.min(10, Math.max(1, Math.trunc(params.importance))),
      },
      select: {
        id: true,
      },
    });

    await this.auditService.log({
      companyId: params.companyId,
      userId: params.userId,
      action: 'assistant.memory.created',
      resourceType: 'assistant.memory',
      resourceId: memory.id,
      metadata: {
        type: params.type,
        importance: params.importance,
      },
    });

    return memory.id;
  }

  async getMemoryContext(params: {
    userId: string;
    companyId: string;
    message: string;
  }): Promise<MemoryContext> {
    const [assistantProfile, memories] = await Promise.all([
      this.resolveAssistantProfile(params.companyId, params.userId),
      this.retrieveRelevantMemories({
        userId: params.userId,
        companyId: params.companyId,
        query: params.message,
      }),
    ]);

    await this.auditService.log({
      companyId: params.companyId,
      userId: params.userId,
      action: 'assistant.memory.accessed',
      resourceType: 'assistant.memory',
      metadata: {
        memoryCount: memories.length,
        memoryIds: memories.map((memory) => memory.id),
        assistantProfileId: assistantProfile.id,
      },
    });

    return {
      assistantProfile,
      memories: memories.map((memory) => ({
        id: memory.id,
        type: memory.type,
        content: memory.content,
        importance: memory.importance,
        createdAt: memory.createdAt.toISOString(),
      })),
    };
  }

  async captureMemoryFromUserMessage(params: {
    userId: string;
    companyId: string;
    message: string;
  }): Promise<void> {
    const content = params.message.trim();
    if (!content || content.length < 12 || content.length > 700) {
      return;
    }

    const lower = content.toLowerCase();
    const isPreferenceSignal =
      /(^|\s)(i prefer|i like|my name is|i am|i work|remember|please remember)\b/.test(
        lower,
      );
    if (!isPreferenceSignal) {
      return;
    }

    await this.storeMemory({
      userId: params.userId,
      companyId: params.companyId,
      type: 'PREFERENCE',
      content,
      importance: 7,
    });
  }

  private async retrieveRelevantMemories(params: {
    userId: string;
    companyId: string;
    query: string;
  }): Promise<UserMemory[]> {
    const memories = await this.prisma.userMemory.findMany({
      where: {
        userId: params.userId,
        companyId: params.companyId,
      },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    });
    if (memories.length === 0) {
      return [];
    }

    const queryTokens = this.tokenize(params.query);
    const scored = memories.map((memory) => {
      const memoryTokens = this.tokenize(memory.content);
      const overlap = memoryTokens.filter((token) =>
        queryTokens.includes(token),
      ).length;
      const score = overlap * 3 + memory.importance;
      return { memory, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((row) => row.memory);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2)
      .slice(0, 80);
  }

  private async resolveAssistantProfile(
    companyId: string,
    userId: string,
  ): Promise<{
    id: string;
    name: string;
    systemPrompt: string;
    behaviorConfig: Prisma.JsonValue | null;
    personalPrompt: string | null;
    preferences: Prisma.JsonValue | null;
  }> {
    const assignment = await this.prisma.userAssistantProfile.findFirst({
      where: {
        userId,
        assistantProfile: {
          companyId,
        },
      },
      include: {
        assistantProfile: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (assignment) {
      return this.mapAssistantContext(assignment.assistantProfile, assignment);
    }

    let profile = await this.prisma.assistantProfile.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
    if (!profile) {
      profile = await this.prisma.assistantProfile.create({
        data: {
          companyId,
          name: 'Company Assistant',
          systemPrompt:
            'You are the company assistant. Use company knowledge, be accurate, and avoid unsupported claims.',
          behaviorConfig: {
            tone: 'professional',
            responseStyle: 'concise',
          },
        },
      });
    }

    const createdAssignment = await this.prisma.userAssistantProfile.create({
      data: {
        userId,
        assistantProfileId: profile.id,
        personalPrompt: null,
        preferences: {},
      },
    });

    return this.mapAssistantContext(profile, createdAssignment);
  }

  private mapAssistantContext(
    profile: AssistantProfile,
    assignment: UserAssistantProfile,
  ) {
    return {
      id: profile.id,
      name: profile.name,
      systemPrompt: profile.systemPrompt,
      behaviorConfig: profile.behaviorConfig,
      personalPrompt: assignment.personalPrompt,
      preferences: assignment.preferences,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { FactImportance, MessageRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

type ConversationContext = {
  summary: string | null;
  importantFacts: Array<{
    id: string;
    fact: string;
    importance: FactImportance;
    createdAt: string;
  }>;
  recentMessages: Array<{
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
  }>;
};

@Injectable()
export class ConversationContextService {
  constructor(private readonly prisma: PrismaService) {}

  async loadContext(params: {
    conversationId: string;
    companyId: string;
    workspaceId: string;
  }): Promise<ConversationContext> {
    const [summary, facts, messages] = await Promise.all([
      this.prisma.conversationSummary.findUnique({
        where: { conversationId: params.conversationId },
        select: { summary: true },
      }),
      this.prisma.conversationFact.findMany({
        where: {
          conversationId: params.conversationId,
          companyId: params.companyId,
          importance: { in: [FactImportance.MEDIUM, FactImportance.HIGH] },
        },
        orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
        take: 12,
        select: {
          id: true,
          fact: true,
          importance: true,
          createdAt: true,
        },
      }),
      this.prisma.message.findMany({
        where: {
          conversationId: params.conversationId,
          companyId: params.companyId,
          workspaceId: params.workspaceId,
          deletedAt: null,
          role: {
            in: [MessageRole.USER, MessageRole.ASSISTANT, MessageRole.SYSTEM],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          role: true,
          content: true,
        },
      }),
    ]);

    return {
      summary: summary?.summary ?? null,
      importantFacts: facts.map((fact) => ({
        id: fact.id,
        fact: fact.fact,
        importance: fact.importance,
        createdAt: fact.createdAt.toISOString(),
      })),
      recentMessages: messages.reverse().map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };
  }

  async extractAndStoreFactsFromUserMessage(params: {
    conversationId: string;
    companyId: string;
    userId: string;
    message: string;
  }): Promise<void> {
    const extracted = this.extractFacts(params.message);
    if (extracted.length === 0) {
      return;
    }

    const existing = await this.prisma.conversationFact.findMany({
      where: {
        conversationId: params.conversationId,
        companyId: params.companyId,
      },
      select: { fact: true },
    });
    const existingFacts = new Set(
      existing.map((item) => item.fact.toLowerCase()),
    );

    for (const fact of extracted) {
      if (existingFacts.has(fact.fact.toLowerCase())) {
        continue;
      }
      await this.prisma.conversationFact.create({
        data: {
          conversationId: params.conversationId,
          companyId: params.companyId,
          userId: params.userId,
          fact: fact.fact,
          importance: fact.importance,
        },
      });
    }
  }

  async refreshSummary(params: {
    conversationId: string;
    companyId: string;
    workspaceId: string;
  }): Promise<void> {
    const recentMessages = await this.prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        role: true,
        content: true,
      },
    });

    const summary = recentMessages
      .reverse()
      .map(
        (message) => `${message.role}: ${this.compact(message.content, 140)}`,
      )
      .join(' | ');
    if (!summary) {
      return;
    }

    await this.prisma.conversationSummary.upsert({
      where: { conversationId: params.conversationId },
      update: { summary },
      create: {
        conversationId: params.conversationId,
        summary,
      },
    });
  }

  private extractFacts(message: string): Array<{
    fact: string;
    importance: FactImportance;
  }> {
    const normalized = message.trim();
    if (!normalized) {
      return [];
    }
    const lower = normalized.toLowerCase();
    const facts: Array<{ fact: string; importance: FactImportance }> = [];

    const preferMatch = /^i\s+prefer\s+(.+)$/i.exec(normalized);
    if (preferMatch?.[1]) {
      const preference = this.cleanTail(preferMatch[1]);
      facts.push({
        fact: `User prefers ${preference}`,
        importance: FactImportance.HIGH,
      });
    }

    const manageMatch = /^i\s+manage\s+(.+)$/i.exec(normalized);
    if (manageMatch?.[1]) {
      const scope = this.cleanTail(manageMatch[1]);
      facts.push({
        fact: `User manages ${scope}`,
        importance: FactImportance.HIGH,
      });
    }

    const workMatch = /^i\s+work\s+in\s+(.+)$/i.exec(normalized);
    if (workMatch?.[1]) {
      const department = this.cleanTail(workMatch[1]);
      facts.push({
        fact: `User works in ${department}`,
        importance: FactImportance.MEDIUM,
      });
    }

    const nameMatch = /^my\s+name\s+is\s+(.+)$/i.exec(normalized);
    if (nameMatch?.[1]) {
      const name = this.cleanTail(nameMatch[1]);
      facts.push({
        fact: `User name is ${name}`,
        importance: FactImportance.MEDIUM,
      });
    }

    if (facts.length > 0) {
      return facts;
    }

    if (/i\s+prefer\s+/i.test(lower)) {
      facts.push({
        fact: `User preference stated: ${this.compact(normalized, 160)}`,
        importance: FactImportance.MEDIUM,
      });
    }

    return facts;
  }

  private cleanTail(value: string): string {
    return value.trim().replace(/[.?!\s]+$/g, '');
  }

  private compact(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }
    return `${value.slice(0, maxLength - 1)}…`;
  }
}

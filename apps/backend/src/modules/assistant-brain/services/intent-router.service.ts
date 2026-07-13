import { Injectable } from '@nestjs/common';
import { AssistantIntent } from '../assistant-intent.enum';

@Injectable()
export class IntentRouterService {
  classify(params: {
    message: string;
    conversationSummary?: string | null;
    recentMessages?: Array<{
      role: 'USER' | 'ASSISTANT' | 'SYSTEM';
      content: string;
    }>;
  }): AssistantIntent {
    const normalized = params.message.trim().toLowerCase();
    if (!normalized) {
      return AssistantIntent.CHAT;
    }

    const hasActionSignal = this.matchesAny(normalized, [
      /\b(create|schedule|book|set up|cancel|delete|send|update|remind|assign|execute|run)\b/,
      /\b(meeting|event|email|reminder|invoice reminders?)\b/,
    ]);

    const hasKnowledgeSignal = this.matchesAny(normalized, [
      /\b(what|which|where|when|why|how|explain|summarize|policy|process|procedure|knowledge|document|sop|guide)\b/,
      /\?$/,
    ]);

    if (hasActionSignal && hasKnowledgeSignal) {
      return AssistantIntent.MIXED;
    }
    if (hasActionSignal) {
      return AssistantIntent.ACTION;
    }
    if (hasKnowledgeSignal) {
      return AssistantIntent.KNOWLEDGE;
    }

    return AssistantIntent.CHAT;
  }

  private matchesAny(input: string, patterns: RegExp[]) {
    return patterns.some((pattern) => pattern.test(input));
  }
}

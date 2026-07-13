import { Injectable } from '@nestjs/common';
import type { RetrievedChunk } from '../../knowledge/services/interfaces/retrieval-store.interface';

@Injectable()
export class PromptBuilderService {
  buildPrompt(params: {
    companyId: string;
    workspaceId: string;
    userMessage: string;
    chunks: RetrievedChunk[];
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
      name: string;
      systemPrompt: string;
      behaviorConfig: unknown;
      personalPrompt: string | null;
      preferences: unknown;
    };
  }): string {
    const contextText = params.chunks
      .map(
        (chunk, index) =>
          `[Chunk ${index + 1} | Asset: ${chunk.assetFilename} | Score: ${chunk.similarityScore.toFixed(4)} | Page: ${chunk.chunkMetadata?.pageNumber ?? 'N/A'} | Section: ${chunk.chunkMetadata?.section ?? 'N/A'}]\n${chunk.chunkContent}`,
      )
      .join('\n\n');
    const historyText = params.conversationHistory
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n');
    const memoriesText = params.userMemories
      .map(
        (memory, index) =>
          `[Memory ${index + 1} | Type: ${memory.type} | Importance: ${memory.importance} | CreatedAt: ${memory.createdAt}]\n${memory.content}`,
      )
      .join('\n\n');
    const hasContext = params.chunks.length > 0;
    const profileBehaviorText = params.assistantProfile.behaviorConfig
      ? JSON.stringify(params.assistantProfile.behaviorConfig)
      : '{}';
    const profilePreferencesText = params.assistantProfile.preferences
      ? JSON.stringify(params.assistantProfile.preferences)
      : '{}';

    return [
      `Assistant name: ${params.assistantProfile.name}`,
      params.assistantProfile.systemPrompt,
      'You are an enterprise AI assistant for internal company knowledge.',
      'Follow these non-negotiable rules:',
      '1) Answer ONLY using the retrieved company knowledge context.',
      '2) If context is missing, insufficient, or ambiguous, explicitly say the requested information is not available in company knowledge.',
      '3) Do not guess, invent, or hallucinate details.',
      '4) Always include source citations at the end using the exact asset filename when context exists.',
      '5) Keep answers concise, factual, and auditable.',
      '6) Use conversation history only for user intent continuity; do not treat it as authoritative company knowledge unless it appears in retrieved chunks.',
      `Company: ${params.companyId}`,
      `Workspace: ${params.workspaceId}`,
      `Assistant behavior config: ${profileBehaviorText}`,
      `User preferences: ${profilePreferencesText}`,
      `User personal prompt: ${params.assistantProfile.personalPrompt ?? '[None]'}`,
      '',
      'Conversation history:',
      historyText || '[No prior messages]',
      '',
      'User memory context:',
      memoriesText || '[No relevant user memories found]',
      '',
      'Context:',
      hasContext ? contextText : '[No relevant context found]',
      '',
      `User question: ${params.userMessage}`,
      '',
      hasContext
        ? 'Answer format:\n- Direct answer grounded in retrieved context\n- If partially known, clearly mark unknown parts\n- Sources: [filename 1], [filename 2], ...'
        : 'Answer format:\n- State that relevant company knowledge is missing\n- Suggest which document/topic should be uploaded or clarified\n- Do not provide speculative policy/fact claims',
      '',
      'Answer:',
    ].join('\n');
  }
}

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
  }): string {
    const contextText = params.chunks
      .map(
        (chunk, index) =>
          `[Chunk ${index + 1} | Asset: ${chunk.assetFilename} | Score: ${chunk.similarityScore.toFixed(4)}]\n${chunk.chunkContent}`,
      )
      .join('\n\n');
    const historyText = params.conversationHistory
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n');
    const hasContext = params.chunks.length > 0;

    return [
      'You are the AI Business Assistant.',
      'Use provided company context when available.',
      'If no relevant context exists, clearly say no company knowledge was found and continue as a normal helpful assistant.',
      'Maintain conversation continuity using prior messages.',
      `Company: ${params.companyId}`,
      `Workspace: ${params.workspaceId}`,
      '',
      'Conversation history:',
      historyText || '[No prior messages]',
      '',
      'Context:',
      hasContext ? contextText : '[No relevant context found]',
      '',
      `User question: ${params.userMessage}`,
      '',
      'Answer:',
    ].join('\n');
  }
}

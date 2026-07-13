import { Injectable } from '@nestjs/common';
import type { RetrievedChunk } from '../../knowledge/services/interfaces/retrieval-store.interface';

@Injectable()
export class PromptBuilderService {
  buildPrompt(params: {
    companyId: string;
    workspaceId: string;
    userMessage: string;
    chunks: RetrievedChunk[];
  }): string {
    const contextText = params.chunks
      .map(
        (chunk, index) =>
          `[Chunk ${index + 1} | Asset: ${chunk.assetFilename} | Score: ${chunk.similarityScore.toFixed(4)}]\n${chunk.chunkContent}`,
      )
      .join('\n\n');

    return [
      'You are the AI Business Assistant.',
      'Answer only using the provided context when possible.',
      `Company: ${params.companyId}`,
      `Workspace: ${params.workspaceId}`,
      '',
      'Context:',
      contextText || '[No relevant context found]',
      '',
      `User question: ${params.userMessage}`,
      '',
      'Answer:',
    ].join('\n');
  }
}

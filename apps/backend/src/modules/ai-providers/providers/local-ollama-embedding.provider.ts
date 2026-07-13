import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider } from '../interfaces/embedding-provider.interface';

@Injectable()
export class LocalOllamaEmbeddingProvider implements EmbeddingProvider {
  private readonly logger = new Logger(LocalOllamaEmbeddingProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'app.ollamaUrl',
      'http://localhost:11434',
    );
    this.model = this.configService.get<string>(
      'app.ollamaEmbedModel',
      'nomic-embed-text',
    );
  }

  async createEmbedding(input: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: input,
      }),
    });
    if (!response.ok) {
      this.logger.error(`Ollama embedding request failed: ${response.status}`);
      throw new Error('Failed to generate embedding from Ollama');
    }

    const payload = (await response.json()) as { embedding?: number[] };
    if (!payload.embedding || payload.embedding.length === 0) {
      throw new Error('Ollama embedding response was empty');
    }

    return payload.embedding;
  }

  getModelName(): string {
    return this.model;
  }
}

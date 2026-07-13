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
    const payload = JSON.stringify({
      model: this.model,
      prompt: input,
      input,
    });
    const legacyResponse = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    if (legacyResponse.ok) {
      const legacyPayload = (await legacyResponse.json()) as {
        embedding?: number[];
      };
      if (!legacyPayload.embedding || legacyPayload.embedding.length === 0) {
        throw new Error('Ollama embedding response was empty');
      }
      return legacyPayload.embedding;
    }

    if (legacyResponse.status !== 404) {
      this.logger.error(
        `Ollama embedding request failed: ${legacyResponse.status}`,
      );
      throw new Error('Failed to generate embedding from Ollama');
    }

    const embedResponse = await fetch(`${this.baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (!embedResponse.ok) {
      this.logger.error(`Ollama embed request failed: ${embedResponse.status}`);
      throw new Error('Failed to generate embedding from Ollama');
    }

    const embedPayload = (await embedResponse.json()) as {
      embeddings?: number[][];
      embedding?: number[];
    };
    const vector = embedPayload.embedding ?? embedPayload.embeddings?.[0];
    if (!vector || vector.length === 0) {
      throw new Error('Ollama embedding response was empty');
    }

    return vector;
  }

  getModelName(): string {
    return this.model;
  }
}

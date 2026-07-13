import { Injectable } from '@nestjs/common';
import { AIProvider } from './interfaces/ai-provider.interface';
import { EmbeddingProvider } from './interfaces/embedding-provider.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { LocalOllamaEmbeddingProvider } from './providers/local-ollama-embedding.provider';

@Injectable()
export class AiProvidersService {
  constructor(
    private readonly ollamaProvider: OllamaProvider,
    private readonly localOllamaEmbeddingProvider: LocalOllamaEmbeddingProvider,
  ) {}

  getChatProvider(): AIProvider {
    return this.ollamaProvider;
  }

  getEmbeddingProvider(): EmbeddingProvider {
    return this.localOllamaEmbeddingProvider;
  }
}

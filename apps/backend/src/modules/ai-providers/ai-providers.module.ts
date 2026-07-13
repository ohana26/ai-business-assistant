import { Module } from '@nestjs/common';
import { AiProvidersController } from './ai-providers.controller';
import { AiProvidersService } from './ai-providers.service';
import { OllamaProvider } from './providers/ollama.provider';
import { LocalOllamaEmbeddingProvider } from './providers/local-ollama-embedding.provider';

@Module({
  controllers: [AiProvidersController],
  providers: [AiProvidersService, OllamaProvider, LocalOllamaEmbeddingProvider],
  exports: [AiProvidersService, OllamaProvider, LocalOllamaEmbeddingProvider],
})
export class AiProvidersModule {}

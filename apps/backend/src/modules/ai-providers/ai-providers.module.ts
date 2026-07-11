import { Module } from '@nestjs/common';
import { AiProvidersController } from './ai-providers.controller';
import { AiProvidersService } from './ai-providers.service';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  controllers: [AiProvidersController],
  providers: [AiProvidersService, OllamaProvider],
  exports: [AiProvidersService, OllamaProvider],
})
export class AiProvidersModule {}

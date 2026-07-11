import { Injectable } from '@nestjs/common';
import { AIProvider } from './interfaces/ai-provider.interface';
import { OllamaProvider } from './providers/ollama.provider';

@Injectable()
export class AiProvidersService {
  constructor(private readonly ollamaProvider: OllamaProvider) {}

  getProvider(): AIProvider {
    return this.ollamaProvider;
  }
}

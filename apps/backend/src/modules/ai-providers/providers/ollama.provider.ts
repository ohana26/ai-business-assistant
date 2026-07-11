import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);

  generateResponse(prompt: string): Promise<string> {
    void prompt;
    this.logger.debug('OllamaProvider.generateResponse placeholder invoked');
    return Promise.resolve('Ollama response placeholder');
  }

  createEmbedding(input: string): Promise<number[]> {
    void input;
    this.logger.debug('OllamaProvider.createEmbedding placeholder invoked');
    return Promise.resolve([]);
  }
}

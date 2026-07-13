import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'app.ollamaUrl',
      'http://localhost:11434',
    );
    this.model = this.configService.get<string>(
      'app.ollamaChatModel',
      'llama3.2:3b',
    );
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      this.logger.error(`Ollama chat request failed: ${response.status}`);
      throw new Error('Failed to generate response from Ollama');
    }

    const payload = (await response.json()) as { response?: string };
    return payload.response?.trim() ?? '';
  }

  getModelName(): string {
    return this.model;
  }
}

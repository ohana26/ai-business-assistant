import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  environment: process.env.NODE_ENV ?? 'development',
  aiProvider: process.env.AI_PROVIDER ?? 'ollama',
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
}));

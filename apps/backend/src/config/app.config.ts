import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  environment: process.env.NODE_ENV ?? 'development',
  aiProvider: process.env.AI_PROVIDER ?? 'ollama',
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

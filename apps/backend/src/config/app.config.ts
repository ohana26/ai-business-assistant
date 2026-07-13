import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  environment: process.env.NODE_ENV ?? 'development',
  corsOrigins:
    process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173',
  aiProvider: process.env.AI_PROVIDER ?? 'ollama',
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  storageProvider: process.env.STORAGE_PROVIDER ?? 'local',
  storagePath: process.env.STORAGE_PATH ?? './storage',
  ollamaChatModel: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2:3b',
  ollamaKeepAlive: process.env.OLLAMA_KEEP_ALIVE ?? '5m',
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  chunkSize: Number(process.env.CHUNK_SIZE ?? 1000),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP ?? 200),
  retrievalTopK: Number(process.env.RETRIEVAL_TOP_K ?? 5),
  minSimilarityScore: Number(process.env.MIN_SIMILARITY_SCORE ?? 0),
}));

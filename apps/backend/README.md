# Backend Application Foundation

Phase 1.3 backend foundation for the Enterprise AI Knowledge Platform.

## Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- pgvector preparation

## Current Scope

Implemented:
- backend project scaffold
- modular architecture placeholders
- environment configuration with validation
- Prisma baseline setup
- health endpoint (`GET /health`)
- AI provider abstraction and placeholder Ollama provider

Not implemented yet:
- business logic
- authentication flow
- RAG / knowledge engine internals
- domain models and migrations

## Module Structure

```text
src/
  common/
  config/
  database/
  health/
  modules/
    auth/
    users/
    companies/
    workspaces/
    knowledge/
    assistants/
    agent/
    tools/
    ai-providers/
```

Each domain module currently contains placeholders:
- `*.module.ts`
- `*.controller.ts`
- `*.service.ts`

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`
- `PORT`
- `AI_PROVIDER`
- `OLLAMA_URL`

## Health Endpoint

`GET /health`

Example response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-11T15:00:00.000Z",
  "environment": "development"
}
```

## Swagger API Docs

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

After starting the backend, open `/docs` in your browser to inspect and test endpoints.

## Prisma Commands

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio
```

## Run Locally

From repository root:

```bash
npm install
npm run start:dev -w backend
```

Or from `apps/backend`:

```bash
npm install
npm run start:dev
```

## Quality Checks

```bash
npm run lint
npm run build
```

# AI Business Assistant Platform

Monorepo foundation for an Enterprise AI Knowledge and Automation Platform.

## Repository Structure

```text
apps/
  frontend/            # React + Vite + TypeScript app (Phase 1 next step)
  backend/             # NestJS API app (Phase 1 next step)
packages/
  shared-types/        # Shared TypeScript types/contracts
docs/                  # Architecture and planning documentation
infrastructure/        # Docker, local infra, deployment assets
```

## Current Status

This repository currently contains the Phase 1 monorepo scaffold and architecture documents.

Application scaffolding (frontend/backend), database services, and Prisma setup are intentionally implemented in subsequent incremental steps.

## Getting Started (Current)

No runnable apps are created yet in this step.

Next step will initialize:
- `apps/frontend` with React + Vite + TypeScript
- `apps/backend` with NestJS + TypeScript
- `infrastructure/docker-compose.yml` for PostgreSQL (pgvector) and Ollama

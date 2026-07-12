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

Phase 1 foundations are in place:
- frontend scaffold (`apps/frontend`)
- backend scaffold (`apps/backend`)
- local infrastructure compose setup (`infrastructure/docker-compose.yml`)

## Quick Start

Install dependencies:

```bash
npm install
```

Start infrastructure + backend + frontend from root:

```bash
npm start
```

Stop infrastructure services:

```bash
npm run stop
```

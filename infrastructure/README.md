# Local Infrastructure

This directory contains local infrastructure for backend development.

## Services

`docker-compose.yml` starts:

1. **PostgreSQL 16 + pgvector**
   - image: `pgvector/pgvector:pg16`
   - persistent volume: `postgres_data`
   - initialization SQL enables `vector` extension
   - health check with `pg_isready`

2. **Ollama**
   - image: `ollama/ollama:latest`
   - persistent volume: `ollama_data`
   - health check via `ollama list`

## Start Services

From repository root:

```bash
npm run docker:up
```

Or directly:

```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

## Stop Services

```bash
npm run docker:down
```

## View Logs

```bash
npm run docker:logs
```

## Check Service Status

```bash
docker compose -f infrastructure/docker-compose.yml ps
```

## Database Access

Connect from host:

```bash
psql "postgresql://postgres:postgres@localhost:5432/ai_business_assistant"
```

Connect inside container:

```bash
docker exec -it ai-business-postgres psql -U postgres -d ai_business_assistant
```

## Prisma / Backend Alignment

Backend `.env` should use:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_business_assistant?schema=public
```

After services are up, run migrations:

```bash
cd apps/backend
npm run prisma:migrate:dev
```

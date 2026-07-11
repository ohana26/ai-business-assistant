# AI Business Assistant Platform - System Architecture

## 1) Product Vision and Architecture Goals

The platform is a **multi-tenant B2B SaaS** where each company can create private AI assistants and query only its own knowledge.

Core goals:
- Strict tenant isolation by company
- Production-ready modular design from day one
- Local-first RAG using free/local models (Ollama) for learning and validation
- Evolution path to SaaS scale and enterprise dedicated deployments

---

## 2) High-Level Architecture (Modular Monolith First)

### Why modular monolith now
- Faster development/learning loop than microservices
- Simpler debugging and deployment on local machine
- Strong internal module boundaries allow later extraction

### Runtime components (local v1)
- **Frontend**: React + Vite + TypeScript + Material UI
- **Backend**: NestJS REST API (modular monolith)
- **Database**: PostgreSQL + pgvector
- **AI runtime**: Ollama (LLM + embedding model)
- **Storage**: local filesystem (v1), object storage later
- **Orchestration**: Docker Compose

### Logical architecture
1. Frontend calls NestJS REST APIs (JWT auth)
2. Backend enforces company scoping in each module
3. Documents are uploaded and processed into chunks + embeddings
4. Embeddings stored in Postgres pgvector
5. Chat pipeline retrieves relevant chunks and generates grounded answers
6. Responses include citations (document/chunk metadata)

---

## 3) Backend Module Design

NestJS modules (initial + future-ready):
- `auth`
- `users`
- `companies`
- `assistants`
- `documents`
- `rag`
- `chat`
- `ai-providers`
- `billing` (future)
- `analytics` (future)

Each module should contain:
- `controller/`
- `service/`
- `repository/`
- `dto/`
- `entities/` (or `types/`)

### Responsibilities

#### auth
- Register/login, password hashing, JWT issuance/validation
- Tenant-safe authentication context (`userId`, `companyId`, `role`)

#### users
- User profile and membership management
- Company-scoped user lookup and role checks

#### companies
- Company creation and configuration
- Company metadata and tenant policies

#### assistants
- Create/configure assistants per company
- Assistant-level AI settings (provider/model/system prompt/retrieval params)

#### documents
- Upload, parse status tracking, file metadata, document lifecycle
- Triggers ingestion pipeline into RAG module

#### rag
- Text cleaning/chunking/embedding/indexing/retrieval
- Retrieval policy and citation packing

#### chat
- Conversation orchestration
- Prompt assembly, context injection, answer + sources response
- Conversation persistence and audit trail

#### ai-providers
- Provider abstraction layer and model routing
- Current implementation: Ollama
- Future implementations: OpenAI, Anthropic, private endpoints

#### billing (future)
- Plan limits, subscription status, usage accounting hooks

#### analytics (future)
- Query analytics, document coverage metrics, quality feedback loops

---

## 4) AI Provider Abstraction

## Interface contract
Define an internal interface (e.g., `AIProvider`) used by `rag` and `chat`:
- `generateEmbedding(input: string): Promise<number[]>`
- `generateCompletion(request: CompletionRequest): Promise<CompletionResponse>`
- `healthCheck(): Promise<ProviderStatus>`
- `getCapabilities(): ProviderCapabilities`

Implementations:
- `OllamaProvider` (v1)
- `OpenAIProvider` (future)
- `AnthropicProvider` (future)
- `PrivateModelProvider` (future)

### Why this matters
- Business modules stay provider-agnostic
- Easier migration between local and hosted AI
- Enables per-company provider policy in enterprise mode

---

## 5) Multi-Tenant Isolation Strategy

### Tenant key
- `company_id` as required foreign key on tenant-owned entities

### Enforcement layers
1. **Auth layer**: JWT includes `companyId`
2. **Application layer**: service methods require tenant context
3. **Repository layer**: all queries are tenant-filtered
4. **DB constraints**: FK + unique indexes include company boundaries

### Isolation model now vs future
- v1: shared DB with strict row-level scoping in app logic
- future enterprise: dedicated DB and dedicated AI runtime per company

---

## 6) RAG Pipeline Architecture

## Ingestion flow
`Upload -> Extract text -> Clean -> Chunk -> Embed -> Store vectors -> Ready`

### Detailed steps
1. Document upload (PDF initially)
2. Text extraction (page-level metadata retained)
3. Cleaning/normalization:
   - remove duplicated whitespace
   - preserve headings/lists where possible
   - keep references to page/section
4. Chunking:
   - default target: ~700-1000 tokens per chunk
   - overlap: ~10-20% to reduce boundary information loss
   - strategy: semantic-aware splitting by headings/paragraphs first, then token fallback
5. Embedding generation with `nomic-embed-text` (via Ollama)
6. Persist chunks + embeddings (`pgvector`) + metadata

## Query flow
`Question -> Embed query -> Similarity search -> Re-rank/filter -> Prompt assembly -> LLM answer -> Citations`

### Retrieval strategy (v1)
- Top-k vector similarity (cosine distance)
- filter by `company_id`, `assistant_id`
- optional document status filters (`READY`)
- configurable `k` per assistant

### Citation and grounding
- Include chunk metadata: filename, page, chunk index, document id
- Return sources with each answer
- Prompt policy: answer only from retrieved context, otherwise admit uncertainty

### Future RAG improvements
- Hybrid search (vector + keyword/BM25)
- Reranker model for better precision
- Query rewriting and decomposition
- Context compression and deduplication
- Evaluation pipeline (retrieval hit rate, groundedness scores)

---

## 7) Frontend Architecture

Stack:
- React + Vite + TypeScript
- React Router
- React Query
- Zustand
- Material UI

### App shell
- `AuthLayout` and `DashboardLayout`
- Route guards by auth state/role
- Shared design system via MUI theme tokens

### State management boundaries
- **React Query**: server state (API data, cache, invalidation)
- **Zustand**: client/session/UI state (selected assistant, chat UI preferences)

### Primary pages
- Auth: Login, Register
- Dashboard overview
- Assistants: list/create/configure
- Documents: upload/status/knowledge management
- Chat: grounded Q&A with citations
- Settings: company settings, AI provider settings

---

## 8) Recommended Monorepo Folder Structure

```text
ai-business-assistant/
  apps/
    web/                       # React frontend
      src/
        app/
          routes/
          providers/
          layouts/
        features/
          auth/
          dashboard/
          assistants/
          documents/
          chat/
          settings/
        shared/
          api/
          ui/
          hooks/
          utils/
    api/                       # NestJS backend
      src/
        main.ts
        app.module.ts
        common/
          guards/
          interceptors/
          filters/
          decorators/
          types/
        modules/
          auth/
          users/
          companies/
          assistants/
          documents/
          rag/
          chat/
          ai-providers/
          billing/
          analytics/
      prisma/
        schema.prisma
        migrations/
  packages/
    shared-types/              # DTO contracts/types for web+api
    config/                    # eslint/tsconfig shared presets
  infra/
    docker/
      docker-compose.yml
  docs/
    architecture.md
    database-schema.md
    development-roadmap.md
```

---

## 9) Deployment and Scaling Strategy

### Stage A: Local development
- Single docker-compose stack
- Local Postgres + pgvector + Ollama
- Fast feedback for architecture and RAG tuning

### Stage B: Shared SaaS cloud
- Containerized API + web
- Managed Postgres (with vector support)
- Hosted AI providers and/or dedicated inference nodes
- Per-company usage limits, observability, billing hooks

### Stage C: Enterprise dedicated deployment
- One deployment unit per enterprise customer:
  - dedicated API instance
  - dedicated database/vector storage
  - dedicated AI model runtime/network boundary
- Optional private VPC peering / private model endpoints
- Strong compliance and data residency controls

---

## 10) Key Architectural Decisions Summary

1. **Modular monolith first** for speed + maintainability
2. **Tenant isolation by design** (`company_id` + layered enforcement)
3. **Provider abstraction** to avoid model/vendor lock-in
4. **RAG with citations** as first-class behavior, not optional
5. **Local-first AI stack** (Ollama + local models) to deeply learn RAG before cloud scale

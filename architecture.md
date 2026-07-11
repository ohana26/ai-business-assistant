# AI Business Assistant Platform - System Architecture

## 1) Product Vision

This product is a **private AI Knowledge Platform for businesses**, not just a chatbot.

Primary capabilities:
- Centralize company knowledge
- Organize knowledge by workspace and collections
- Search and retrieve trusted internal information
- Interact through assistants and other interfaces (chat is one interface)

Core objectives:
- Strict multi-tenant isolation
- Workspace-level knowledge ownership
- Reusable knowledge bases across multiple assistants
- Replaceable AI/retrieval pipeline components
- Evolution path: local -> shared SaaS -> enterprise dedicated

---

## 2) Domain Architecture (Workspace-Centric)

## Core hierarchy
`Company -> Workspace -> Knowledge Base -> Collection -> Document -> Chunk`

Assistant relationship:
- `Workspace -> Assistants`
- Assistants reference one or more knowledge bases
- Assistants do **not** own documents

### Why this model
1. Enables departmental partitioning (HR, Engineering, Sales) within one company
2. Avoids document duplication across assistants
3. Supports future retrieval filters by collection/workspace/topic
4. Improves scalability and governance

---

## 3) High-Level Runtime Architecture (Modular Monolith First)

### Runtime components (v1 local)
- Frontend: React + Vite + TypeScript + Material UI
- Backend: NestJS REST API (modular monolith)
- Database: PostgreSQL + pgvector
- AI runtime: Ollama (LLM + embedding model)
- File storage: local filesystem (v1), object storage later
- Orchestration: Docker Compose

### Logical flow
1. Frontend calls backend APIs with JWT auth
2. Backend resolves `company_id` and `workspace_id` context
3. Knowledge source ingestion pipeline processes documents into chunks + vectors
4. Retriever fetches relevant chunks from pgvector
5. Prompt is generated and sent through provider abstraction
6. Response post-processing adds citations and telemetry

---

## 4) Backend Module Design

Base modules for MVP:
- `auth`
- `users`
- `companies`
- `workspaces`
- `knowledge-bases`
- `collections`
- `knowledge-sources`
- `documents`
- `rag`
- `assistants`
- `chat`
- `ai-providers`
- `ai-observability`

Future modules (post-MVP):
- `analytics`
- `billing`

Each module structure:
- `controller/`
- `service/`
- `repository/`
- `dto/`
- `entities/` or `types/`

### Key module responsibilities

#### workspaces
- Create/manage workspace boundaries within a company
- Resolve membership and workspace access scope

#### knowledge-bases
- Create/manage reusable knowledge bases
- Bind knowledge bases to workspace
- Link assistants to one or more knowledge bases

#### collections
- Organize documents into semantic groups (Policies, HR, Products)
- Provide retrieval filtering boundary

#### knowledge-sources
- Generic source abstraction and ingestion orchestration
- Source type strategy dispatch (PDF in v1, others later)

#### documents
- Persist document metadata and processing state
- Maintain extracted content lifecycle and version metadata

#### rag
- Embedding, retrieval, context assembly components
- Pipeline orchestration with replaceable stages

#### ai-observability
- AI request log storage and query endpoints
- Feedback recording and retrieval diagnostics

---

## 5) Knowledge Source Connector Architecture

Design a provider abstraction for knowledge ingestion:

`KnowledgeSourceProvider`
- `validate(config)`
- `fetch(sourceConfig)`
- `extract(rawPayload)`
- `normalize(extractedContent)`

Source types:
- PDF (v1 implementation)
- DOCX (future)
- TXT (future)
- Website (future)
- Notion (future)
- Confluence (future)
- SharePoint (future)
- Google Drive (future)
- GitHub (future)

### Why this approach
- Keeps ingestion extensible without rewriting core RAG logic
- Allows connector-specific auth/polling/webhook strategies later
- Makes enterprise integrations additive

---

## 6) AI Provider Abstraction

Business logic must never depend on specific model vendors.

`AIProvider` interface (conceptual):
- `generateEmbedding(input, options)`
- `generateCompletion(prompt, options)`
- `countTokens(payload)`
- `healthCheck()`
- `capabilities()`

Implementations:
- `OllamaProvider` (MVP)
- `OpenAIProvider` (future)
- `AnthropicProvider` (future)
- `AzureOpenAIProvider` (future)
- `PrivateModelServerProvider` (future)

---

## 7) Replaceable AI Pipeline Architecture

## Ingestion pipeline
`Source -> Extractor -> Cleaner -> Chunker -> Embedder -> Vector Store`

## Query pipeline
`Question -> Embedding -> Retriever -> Context Builder -> Prompt Builder -> LLM Provider -> Response Post Processor -> Citations -> Answer`

### Component roles
- **Retriever**: similarity search + metadata filters (`company`, `workspace`, `knowledge_base`, `collection`)
- **Context Builder**: dedupe, trim, and rank contexts for token budget
- **Prompt Builder**: consistent grounding/system instructions
- **Response Post Processor**: citation formatting, hallucination safeguards, answer envelope

### MVP retrieval policy
- Vector search via pgvector (cosine similarity)
- Top-k configurable at assistant level
- Hard filters by tenant/workspace/knowledge-base/collection
- Return chunk and document metadata for citations

### Future upgrades
- Hybrid retrieval (keyword + vector)
- Cross-encoder reranking
- Query rewriting and decomposition
- Evaluation harness for relevance/groundedness

---

## 8) Observability and AI Request Logging

Introduce `AIRequestLog` as a first-class entity for debugging and enterprise governance.

Each request should capture:
- question
- retrieved chunks
- retrieved documents
- final prompt
- model/provider
- response
- latency
- token usage
- user feedback
- timestamp

Operational value:
- Supports root-cause analysis for bad answers
- Enables performance tuning and prompt/retrieval audits
- Provides enterprise-ready traceability

---

## 9) Multi-Tenant Isolation Strategy

Primary isolation keys:
- `company_id`
- `workspace_id` (for workspace-owned resources)

Enforcement layers:
1. Auth token carries company + workspace access scope
2. Service methods require tenant/workspace context
3. Repository queries enforce scoped filters
4. DB constraints preserve parent-child consistency

Future hardening:
- optional PostgreSQL RLS
- dedicated per-customer deployment for enterprise tenants

---

## 10) Frontend Architecture

Tech stack:
- React + Vite + TypeScript
- Material UI
- React Router
- React Query
- Zustand

### Product surface (MVP-focused)
- Authentication: login/register
- Workspace dashboard
- Knowledge bases + collections management
- Document upload + processing status (PDF in v1)
- Assistant management (assistant linked to knowledge base)
- Question/answer interface with citations
- AI request logs (basic internal diagnostics view)

### State boundaries
- React Query: API/server state and cache invalidation
- Zustand: UI/session state (selected workspace/assistant/filters)

---

## 11) Recommended Folder Structure

```text
ai-business-assistant/
  apps/
    web/
      src/
        app/
          routes/
          layouts/
          providers/
        features/
          auth/
          workspaces/
          knowledge-bases/
          collections/
          documents/
          assistants/
          qa-interface/
          ai-observability/
        shared/
          api/
          ui/
          hooks/
          utils/
    api/
      src/
        main.ts
        app.module.ts
        common/
          guards/
          interceptors/
          decorators/
          filters/
          types/
        modules/
          auth/
          users/
          companies/
          workspaces/
          knowledge-bases/
          collections/
          knowledge-sources/
          documents/
          rag/
          assistants/
          chat/
          ai-providers/
          ai-observability/
      prisma/
        schema.prisma
        migrations/
  packages/
    shared-types/
    config/
  infra/
    docker/
      docker-compose.yml
  docs/
    architecture.md
    database-schema.md
    development-roadmap.md
    entity-relationship-diagram.md
    system-context-diagram.md
```

---

## 12) Deployment Evolution Strategy

### V1: Single local deployment
- Single compose stack
- Local Postgres + pgvector + Ollama
- Ideal for architecture learning and RAG iteration

### V2: Shared SaaS deployment
- Shared multi-tenant API and DB
- Managed database/vector infrastructure
- Observability and operational controls expanded

### V3: Enterprise dedicated deployment
- Per-customer isolated backend + DB + AI runtime
- Optional private network boundaries and private model endpoints

Design intent: same domain and module model across all stages, minimizing rewrite risk.

---

## 13) MVP Scope Guardrails

MVP includes:
- Company and workspace creation
- PDF upload
- Knowledge base and collection organization
- Assistant linked to knowledge base
- Question answering with citations
- Basic AI request logging

MVP excludes:
- billing/payments
- marketing website
- enterprise deployment automation
- SSO
- advanced fine-grained permissions

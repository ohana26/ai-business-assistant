# AI Business Assistant Platform - Development Roadmap

This roadmap follows a **local-first, production-quality** path:
- Learn and validate RAG deeply
- Keep architecture scalable
- Avoid premature complexity

---

## 0) Guiding Execution Strategy

Principles:
1. Build a modular monolith with strict boundaries
2. Ship vertical slices (backend + frontend + DB) by capability
3. Add observability and testing as each capability lands
4. Keep AI provider integration abstract from day one

Definition of done per phase:
- Working feature flow
- API contract documented
- Basic automated tests
- Tenant isolation checks

---

## Phase 1 - Project Foundation

## Goals
- Establish monorepo and local runtime
- Confirm all required technologies work together

## Deliverables
- Monorepo structure (`apps/web`, `apps/api`, shared packages)
- React + Vite + TypeScript + MUI scaffold
- NestJS scaffold with modular structure
- Docker Compose for:
  - PostgreSQL + pgvector
  - Ollama
  - backend/frontend services (optional for dev)
- Prisma setup and initial migration pipeline
- Base CI checks (lint, typecheck, test placeholders)

## Acceptance criteria
- `docker compose up` starts required dependencies
- Backend can connect to Postgres
- Frontend can call health endpoint

---

## Phase 2 - Core SaaS Foundation

## Goals
- Implement tenant-aware identity and access basics

## Deliverables
- `companies` module:
  - create/read company
- `users` module:
  - create user, company association, roles
- `auth` module:
  - register/login
  - JWT auth guard
- Role-based authorization guard (`OWNER`, `ADMIN`, `MEMBER`)
- Request tenant context propagation (`companyId`)

## Acceptance criteria
- Users can register/login under a company
- Protected APIs enforce auth + tenant scope
- No cross-company read/write possible in tested scenarios

---

## Phase 3 - RAG Engine (Core Learning Phase)

## Goals
- Build full ingestion and retrieval loop using local models

## Deliverables
- `documents` module:
  - upload endpoint
  - status tracking (`UPLOADED -> PROCESSING -> READY/FAILED`)
- `rag` module:
  - PDF text extraction
  - cleaning/normalization
  - chunking (configurable size/overlap)
  - embeddings via `nomic-embed-text` (Ollama)
  - pgvector insert + similarity retrieval
- Metadata + citation-ready chunk storage
- Background job flow (initially in-process queue; future external queue)

## Acceptance criteria
- Upload PDF and produce chunks/embeddings successfully
- Retrieval returns relevant chunks for a sample query
- Retrieval is tenant-scoped and assistant-scoped

---

## Phase 4 - AI Assistant Experience

## Goals
- Deliver user-facing assistant chat with grounded answers

## Deliverables
- `chat` module:
  - ask question endpoint
  - retrieval + prompt assembly
  - answer generation via provider abstraction
  - conversation persistence
  - source citation storage/return
- Frontend chat UI:
  - ask questions
  - display answer
  - show sources/citations (filename/page/chunk)
- Conversation history page

## Acceptance criteria
- Assistant answers are grounded in retrieved chunks
- Response includes sources used
- Chat history is visible and scoped correctly

---

## Phase 5 - Product Features and Operational Readiness

## Goals
- Move from functional prototype to SaaS-ready baseline

## Deliverables
- Multiple assistants per company
- Assistant configuration UI (model/provider/retrieval params)
- Basic analytics:
  - query count
  - document processing success/failure rates
  - latency metrics
- Billing preparation:
  - subscription table + plan limits scaffolding
- Security hardening:
  - rate limiting
  - payload validation
  - audit logging

## Acceptance criteria
- Multi-assistant workflows work end-to-end
- Usage data is trackable per company
- Plan-limit hooks exist for future billing integration

---

## Cross-Cutting Tracks (Run Across Phases)

## A) Testing Strategy
- Unit tests per service/module
- Integration tests for module boundaries
- E2E tests for critical workflows:
  - auth
  - document ingestion
  - grounded chat

## B) Observability
- Structured logging with request IDs
- Basic metrics (latency, errors, processing times)
- Health/readiness endpoints

## C) Security and Compliance Baseline
- Password hashing best practices
- JWT rotation strategy (future)
- Input validation and sanitization
- Tenant boundary tests in CI

## D) Developer Experience
- Shared lint/type/test scripts
- Seed scripts for demo companies and documents
- API docs (OpenAPI/Swagger from NestJS)

---

## Future Scaling Strategy (Post-MVP)

### 1) From shared SaaS to enterprise-dedicated deployments
- Deployment topology options:
  - Shared multi-tenant (default SMB)
  - Dedicated stack per enterprise company
- Dedicated mode includes:
  - isolated backend
  - isolated DB/vector store
  - isolated AI provider runtime

### 2) Module extraction path (when needed)
Potential first extractions from monolith:
1. `rag` ingestion workers
2. `chat` orchestration API
3. `billing` and metering

Extraction readiness signals:
- sustained load hotspots
- independent scaling profiles
- stricter organizational boundaries

### 3) AI provider expansion
- Keep provider interface stable
- Add hosted providers behind same abstraction
- Allow per-company provider policies

---

## Suggested First Implementation Iteration (Next Step After Approval)

1. Create monorepo skeleton + Docker Compose
2. Add Prisma schema + initial migration
3. Build auth/company/user modules with tenant guardrails
4. Add minimal frontend auth + dashboard shell
5. Verify end-to-end local login flow

This gives a stable base before RAG complexity is introduced.

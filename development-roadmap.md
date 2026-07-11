# AI Business Assistant Platform - Development Roadmap

This roadmap keeps the MVP focused on a **private AI knowledge platform**:
- Workspace-based knowledge organization
- PDF ingestion for v1
- Reusable knowledge bases connected to assistants
- Grounded Q/A with citations

Out of MVP scope: billing, payments, SSO, advanced permissions, marketing site, enterprise deployment automation.

---

## 0) Execution Principles

1. Modular monolith with strong module boundaries
2. Workspace-centric data model from day one
3. Replaceable connectors and AI pipeline components
4. Build observability (AI request logs) as core behavior, not an add-on
5. Deliver thin vertical slices with validation at each phase

Definition of done per phase:
- Functional workflow
- API contracts documented
- Tenant/workspace isolation verified
- Basic tests for new modules

---

## Phase 1 - Foundation and Runtime Setup

## Goals
- Establish monorepo and local infrastructure
- Prepare base modules and engineering conventions

## Deliverables
- Monorepo skeleton (`apps/web`, `apps/api`, shared packages)
- React + Vite + TypeScript + MUI shell
- NestJS modular shell with required modules
- Docker Compose with PostgreSQL + pgvector + Ollama
- Prisma migration baseline
- Project-wide lint/typecheck/test scripts

## Acceptance criteria
- Services start locally with one command
- API reaches database and health endpoints
- Frontend can reach API health endpoint

---

## Phase 2 - Identity and Tenant Foundations

## Goals
- Implement company/workspace-aware access foundations

## Deliverables
- Auth module (register/login/JWT)
- Companies and users modules
- Workspaces module
- Workspace membership model
- Tenant/workspace scope guards in API layer

## Acceptance criteria
- Company can register and create workspaces
- Workspace access is enforced for protected endpoints
- No cross-company data access in tested flows

---

## Phase 3 - Knowledge Model and PDF Ingestion (MVP Core)

## Goals
- Build reusable knowledge base architecture and ingestion for PDF

## Deliverables
- Knowledge bases module
- Collections module
- Knowledge sources module (generic abstraction + PDF provider only)
- Documents module with processing statuses
- PDF extraction + cleaning + chunking pipeline
- Embedding generation via Ollama (`nomic-embed-text`)
- Chunk and vector storage via pgvector

## Acceptance criteria
- User can create workspace, knowledge base, and collections
- User can upload PDF into collection and process it successfully
- Chunks and embeddings are persisted with tenant/workspace metadata

---

## Phase 4 - Assistant and Query Pipeline (MVP Core)

## Goals
- Connect assistants to knowledge bases and deliver grounded answers

## Deliverables
- Assistants module with knowledge base linking
- Replaceable query pipeline components:
  - embedding
  - retriever
  - context builder
  - prompt builder
  - LLM provider
  - response post processor
- Chat/QA endpoint and UI
- Citation response contract (document/chunk references)

## Acceptance criteria
- Assistant can query assigned knowledge base
- Answer is returned with citations
- Query path enforces company/workspace boundaries

---

## Phase 5 - AI Observability and MVP Hardening

## Goals
- Make MVP operable and debuggable for real usage

## Deliverables
- AI request logging module and persistence:
  - question
  - retrieved chunks/documents
  - prompt
  - model/provider
  - response
  - latency and token usage
  - feedback
  - timestamp
- Basic request log UI/API for diagnostics
- Reliability hardening:
  - retry/error handling for ingestion and AI calls
  - validation and rate limiting
  - structured logging with request IDs
- Test coverage expansion for critical paths

## Acceptance criteria
- Each AI request is traceable end-to-end
- Failures can be diagnosed from stored logs
- Core MVP user journey is stable

---

## MVP Completion Definition

MVP is complete when a company can:
1. Create at least one workspace
2. Create a knowledge base and collections
3. Upload PDFs and process them into searchable chunks
4. Create an assistant connected to that knowledge base
5. Ask questions and receive grounded answers with citations
6. Inspect AI request logs for debugging

---

## Post-MVP Evolution (Planned, Not in Current Scope)

1. Additional source connectors (DOCX, TXT, website, Notion, Confluence, SharePoint, Google Drive, GitHub)
2. Shared SaaS deployment hardening
3. Enterprise dedicated deployment model
4. Billing and subscription management
5. SSO and advanced permissions

---

## Suggested Next Step After Approval

1. Freeze domain model and entity definitions
2. Finalize module boundaries and API contracts
3. Start Phase 1 implementation only

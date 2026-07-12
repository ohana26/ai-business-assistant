# AI Business Assistant Platform - Development Roadmap

This roadmap evolves the product into an **Enterprise AI Knowledge and Automation Platform** while keeping MVP realistic.

MVP scope (and only this scope):
- Authentication
- Companies
- Workspaces
- Knowledge Bases
- PDF Connector
- Knowledge Engine (RAG capability)
- Chat
- Ollama provider
- Tool framework
- Web Search Tool

---

## 0) Execution Principles

1. Build a modular monolith with clean module boundaries.
2. Model knowledge management and agent orchestration from day one.
3. Keep connectors/tools extensible, but implement only MVP connectors/tools.
4. Enforce tenant and workspace isolation in every phase.
5. Make traceability part of MVP, not a post-MVP afterthought.

Definition of done per phase:
- working end-to-end capability,
- documented API contracts,
- tenant/workspace isolation checks,
- baseline automated tests.

---

## Phase 1 - Platform Foundation

## Goals
- Stand up local-first platform runtime and project skeleton.

## Deliverables
- Monorepo skeleton (`apps/web`, `apps/api`, shared packages)
- React + Vite + TypeScript + MUI shell
- NestJS modular monolith shell
- Docker Compose with Postgres + pgvector + Ollama
- Prisma baseline migration setup
- Core shared config (lint/typecheck/test scripts)

## Acceptance criteria
- local stack starts successfully,
- frontend reaches backend,
- backend reaches database and Ollama.

---

## Phase 2 - Identity and Workspace Boundaries

## Goals
- Implement multi-tenant identity and workspace structure.

## Deliverables
- Auth (register/login/JWT)
- Companies module
- Users module
- Workspaces module
- Workspace membership and scope guards

## Acceptance criteria
- company admin can create workspaces,
- authenticated users only access authorized workspace data,
- no cross-company leaks in tested flows.

---

## Phase 3 - Knowledge Management + PDF Connector (MVP)

## Goals
- Implement knowledge model and ingestion via connector abstraction.

## Deliverables
- Knowledge base and collection modules
- Knowledge source model with connector abstraction
- `PdfConnector` implementation only
- Normalization pipeline to canonical knowledge items
- Chunking + embedding via Ollama (`nomic-embed-text`)
- Vector indexing in pgvector

## Acceptance criteria
- user can create knowledge base and collections,
- user can register a PDF knowledge source and sync,
- knowledge is searchable through indexed chunks.

---

## Phase 4 - Knowledge Engine + Assistant + Chat (MVP)

## Goals
- Deliver grounded question answering from company knowledge.

## Deliverables
- Knowledge Engine module:
  - chunking
  - embeddings
  - retrieval
  - ranking
  - citations
- Assistants module (assistant linked to knowledge bases)
- Chat interface and API
- Ollama provider integration

## Acceptance criteria
- assistant answers based on linked knowledge bases,
- responses include citations,
- retrieval is workspace-scoped.

---

## Phase 5 - Agent Tool Framework + Web Search Tool (MVP)

## Goals
- Introduce tool-based orchestration with internet search capability.

## Deliverables
- Tool framework module:
  - tool interface
  - tool registry
  - tool execution lifecycle
- Minimal agent orchestration path (intent -> tool decision -> execution)
- Web Search Tool integration
- Combined answer flow (knowledge + tool result when needed)
- AI request logging for intent/tools/prompt/response/errors

## Acceptance criteria
- assistant can decide to run web search for web-dependent questions,
- tool executions are logged and traceable,
- responses show evidence from knowledge and/or tools.

---

## MVP Completion Definition

MVP is complete when a company can:
1. Authenticate and manage at least one workspace
2. Create knowledge bases and collections
3. Ingest PDFs through the PDF connector
4. Ask questions via assistant/chat
5. Receive cited responses from knowledge engine
6. Trigger web search tool when required
7. Audit each request (intent, tools, prompt, response, errors)

---

## Post-MVP Expansion (Architecture-Ready, Not Implemented in MVP)

1. Additional connectors (DOCX, TXT, Markdown, Excel, PowerPoint, CSV, OCR, audio/video, SaaS apps, databases, APIs)
2. Additional tools (REST, GraphQL, database, CRM/ERP, email/calendar, MCP tools)
3. Advanced agent workflows and action execution
4. Shared SaaS operational hardening
5. Enterprise dedicated deployment support (single-tenant AWS)
6. SSO, advanced permissions, compliance features
7. Billing and monetization layers

---

## Deployment Strategy Workstream (Documentation-First, Then Implementation)

This cross-cutting workstream is required before broad feature expansion beyond MVP:

1. Finalize multi-topology deployment model:
   - multi-tenant SaaS,
   - single-tenant AWS,
   - private cloud,
   - on-premise future packaging.
2. Standardize Docker image and runtime contract for all topologies.
3. Formalize environment configuration contract (non-secret config vs secret references).
4. Deliver Infrastructure as Code baseline modules and promotion process.
5. Implement secrets lifecycle operations (issuance, rotation, revocation, audit).
6. Finalize storage abstraction contracts across metadata/vector/blob domains.
7. Validate AI provider abstraction with deployment-aware routing policies.
8. Establish production migration process for shared and dedicated environments.

---

## Suggested Next Step After Approval

1. Freeze domain entities and module interfaces in docs
2. Define MVP API contracts per module
3. Begin Phase 1 implementation only

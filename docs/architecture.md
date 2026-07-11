# AI Business Assistant Platform - Enterprise System Architecture

## 1) Core Product Vision

This product is an **Enterprise AI Knowledge and Automation Platform**, not a chatbot.

The assistant is designed to evolve into a company's digital employee that can:
- answer questions,
- search internal company knowledge,
- search the public web when needed,
- call external/internal systems through tools,
- and execute future automated actions.

Chat is one interaction channel, not the product itself.

---

## 2) Architectural Pillars

1. **Knowledge Management First**  
   Knowledge is acquired from many source types through connectors.
2. **Agentic Orchestration**  
   The AI decides which capability or tool to invoke based on intent.
3. **Tool-Driven Integration Layer**  
   APIs, databases, web search, and future MCP integrations use one tool abstraction.
4. **Provider-Agnostic AI Runtime**  
   LLM and embedding providers are interchangeable.
5. **Tenant and Workspace Isolation**  
   Every operation is company and workspace scoped.
6. **Traceability by Default**  
   Every request is logged with intent, tools, retrieval, prompt, output, and errors.

---

## 3) Domain Model (Workspace-Centric)

Core hierarchy:

`Company -> Workspace -> Knowledge Base -> Collection -> Knowledge Source -> Knowledge Item -> Chunk`

Assistant relationship:
- `Workspace -> Assistants`
- Assistants connect to one or multiple knowledge bases
- Knowledge belongs to knowledge bases, not assistants

Why this matters:
- supports departmental boundaries,
- avoids content duplication,
- enables retrieval filtering by workspace/collection/source,
- and allows future automation use-cases beyond Q/A.

---

## 4) Platform Capability Layers

### A) Knowledge Management Layer
- Connector orchestration and sync lifecycle
- Extraction, normalization, enrichment, and indexing
- Knowledge catalog (sources, collections, statuses, metadata)

### B) Knowledge Engine (RAG as one capability)
Responsibilities:
- chunking
- embeddings
- indexing
- retrieval
- ranking
- citations

### C) Agent Orchestrator Layer
Responsibilities:
- classify user intent
- choose execution plan
- invoke one or more tools
- combine tool results
- build final prompt context
- call LLM provider
- produce grounded response and action metadata

### D) Tool Framework Layer
- standardized tool interface
- tool registry and authorization
- tool execution runtime
- typed tool result envelope

---

## 5) Connector Architecture (Knowledge Sources)

Use a connector abstraction for all source systems:

`KnowledgeConnector`
- `authenticate()`
- `sync()`
- `extract()`
- `normalize()`
- `metadata()`

Supported source types (architecture-ready):
- PDF (MVP implementation)
- DOCX
- TXT
- Markdown
- Excel
- PowerPoint
- CSV
- Images (OCR)
- Audio (speech-to-text)
- Video transcription
- Websites
- Notion
- Confluence
- SharePoint
- Google Drive
- OneDrive
- GitHub
- Jira
- Slack
- Microsoft Teams
- Email
- SQL Databases
- REST APIs
- GraphQL APIs
- Custom Connectors

---

## 6) Agent and Tool Execution Model

High-level request path:

`User Request -> Intent Analyzer -> Plan Builder -> Tool Selector -> Tool Executor(s) -> Result Composer -> Prompt Builder -> LLM -> Response Post Processor -> Final Response`

Execution modes:
- **Knowledge mode**: query knowledge engine for grounded answers
- **Web mode**: use web search tool for current events/facts
- **API mode**: call company APIs/tools
- **Hybrid mode**: combine multiple tools + knowledge retrieval

Design constraints:
- no hard assumption that all questions use knowledge retrieval,
- tool execution is auditable and policy-controlled,
- final response always includes evidence/tool trace.

---

## 7) AI Provider Abstraction

Business logic must never depend on provider-specific APIs.

`AIProvider` capabilities:
- `generateEmbedding(input, options)`
- `generateCompletion(prompt, options)`
- `countTokens(payload)`
- `healthCheck()`
- `capabilities()`

Planned implementations:
- `OllamaProvider` (MVP)
- `OpenAIProvider`
- `AnthropicProvider`
- `AzureOpenAIProvider`
- `PrivateLLMServerProvider`

---

## 8) Observability and Auditability

Each AI request must be fully traceable. Persist:
- question
- detected intent
- selected tools
- retrieved knowledge
- final prompt
- provider/model
- response
- latency
- token usage
- errors
- user feedback
- timestamp

This enables:
- enterprise debugging,
- quality monitoring,
- security/compliance auditing,
- and cost/performance optimization.

---

## 9) Backend Modules (Modular Monolith)

MVP modules:
- `auth`
- `users`
- `companies`
- `workspaces`
- `knowledge-bases`
- `collections`
- `knowledge-sources`
- `connectors`
- `knowledge-engine`
- `assistants`
- `chat`
- `agent-orchestrator`
- `tools`
- `web-search-tool`
- `ai-providers`
- `ai-observability`

Future modules:
- `actions-automation`
- `analytics`
- `billing`

Each module shape:
- `controller/`
- `service/`
- `repository/`
- `dto/`
- `entities/` or `types/`

---

## 10) Frontend Architecture

Stack:
- React + Vite + TypeScript
- Material UI
- React Router
- React Query
- Zustand

MVP surfaces:
- authentication
- company/workspace management
- knowledge bases and collections
- PDF source ingestion and status
- assistant management
- chat/interaction interface
- request trace/observability view

State boundaries:
- React Query for API/server state
- Zustand for client UX/session state

---

## 11) Recommended Repository Structure

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
          companies/
          workspaces/
          knowledge-bases/
          collections/
          knowledge-sources/
          assistants/
          chat/
          observability/
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
          connectors/
          knowledge-engine/
          assistants/
          chat/
          agent-orchestrator/
          tools/
          web-search-tool/
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
    system-context-diagram.md
    entity-relationship-diagram.md
    agent-architecture.md
    connector-architecture.md
    tool-framework.md
```

---

## 12) Deployment Evolution Strategy

### MVP: single local deployment
- one docker-compose environment
- local Postgres + pgvector + Ollama
- PDF connector + knowledge engine + basic tools

### Future: shared SaaS
- shared multi-tenant control plane and runtime
- managed storage/database/services
- stronger operational governance and scaling

### Enterprise: dedicated deployment per company
- isolated backend runtime
- isolated database/vector resources
- isolated connector credentials and policy boundary
- dedicated or private AI runtime/provider connectivity

Architecture goal: evolve across these stages without major rewrites.

---

## 13) MVP Scope Guardrails

MVP implements:
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

MVP excludes:
- enterprise deployment automation
- advanced action execution
- SSO and advanced permissions
- billing and payments
- full connector catalog implementation

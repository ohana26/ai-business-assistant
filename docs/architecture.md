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

## 12) Deployment Strategy (Target Topologies)

The platform is designed to support multiple deployment topologies with the same core application architecture and module contracts.

### A) Multi-Tenant SaaS Deployment
Use case:
- default commercial SaaS product for many companies.

Characteristics:
- shared control plane and shared application runtime across tenants,
- strict tenant isolation via `companyId` and `workspaceId` boundaries in every read/write path,
- centralized operations for upgrades, observability, and cost optimization.

Isolation model:
- logical data isolation in shared services,
- optional tenant-specific encryption keys for sensitive enterprise tiers.

### B) Single-Tenant AWS Deployment (Dedicated Customer Stack)
Use case:
- enterprise customers requiring stronger isolation without full on-prem operations.

Characteristics:
- one AWS environment per customer (dedicated VPC/network boundary),
- dedicated application runtime, dedicated database/vector capacity,
- customer-specific integrations, IAM boundaries, and outbound policy controls.

Isolation model:
- infrastructure-level isolation per customer account/project/environment,
- optional dedicated AI provider endpoints and model gateways.

### C) Private Cloud Deployment
Use case:
- customers operating in managed private cloud or regulated hosted environments.

Characteristics:
- same runtime components, deployed into customer private cloud/Kubernetes,
- private networking, private peering, and customer-controlled egress policies,
- compatible with customer SIEM, identity, and secret management systems.

Isolation model:
- tenant can be single-company or customer-defined segmentation in private environment.

### D) On-Premise Deployment (Future)
Use case:
- strict data residency / air-gapped / high-compliance installations.

Characteristics:
- deployable with minimal external dependencies,
- local model/runtime support (for example Ollama or private inference servers),
- offline-capable operations and upgrade bundles.

Isolation model:
- physical and network isolation managed by customer infrastructure.

Architecture requirement:
- each deployment model must reuse the same core modules (auth, workspaces, knowledge, tools, agent, observability) and the same API contracts to avoid code forks.

---

## 13) Docker and Runtime Packaging Strategy

Container strategy:
- package backend and frontend as separate OCI images,
- support profile-based local orchestration with `docker-compose` for development,
- use the same image artifacts across environments (dev/stage/prod) with configuration-only differences.

Image design principles:
- minimal base images and non-root runtime user,
- deterministic builds and pinned build tooling,
- health checks for API, worker, database dependencies, and model endpoints.

Deployment mapping:
- local: docker-compose (Postgres + Ollama + apps),
- cloud/private: Kubernetes or container service using same images,
- on-prem future: compose or K8s manifests from same image set.

---

## 14) Environment Configuration Strategy

Configuration layers:
1. **Static defaults** in code for safe non-secret behavior.
2. **Environment variables** for deployment-specific values.
3. **Secret references** for credentials/tokens/keys.
4. **Tenant-level runtime config** (provider/model/tool policy) in database.

Rules:
- never hardcode secrets in source control,
- validate required environment variables at startup,
- keep provider endpoints, model names, and feature toggles environment-driven,
- use explicit per-environment config (`local`, `staging`, `production`, `enterprise-dedicated`).

---

## 15) Infrastructure as Code (IaC) Plan

Principle:
- every non-local environment is reproducible via IaC.

Proposed approach:
- Terraform/OpenTofu for cloud primitives (networking, compute, DB, object storage, IAM, KMS, DNS),
- Helm/Kustomize for Kubernetes runtime deployment,
- modular stacks:
  - `core-platform` (shared services),
  - `tenant-dedicated` (single-tenant AWS/private cloud),
  - `observability`,
  - `security-baseline`.

State and promotion:
- isolated state per environment/workspace,
- pull-request-driven infra changes with policy checks,
- promotion pipeline from lower to higher environments with drift detection.

---

## 16) Secrets Management Strategy

Requirements:
- centralized secret store per environment,
- strict least-privilege access from workloads,
- audit trail for secret reads/rotations.

Operational pattern:
- inject secrets at runtime from secret manager (not from git),
- rotate database credentials, JWT signing keys, connector credentials, and provider keys,
- support customer-managed keys for enterprise tiers.

Compatibility targets:
- SaaS and single-tenant AWS: AWS Secrets Manager / Parameter Store + KMS,
- private cloud: Vault or cloud-equivalent secret services,
- on-prem future: Vault/offline secret distribution model.

---

## 17) Storage Abstraction Strategy

Storage domains:
- relational metadata (PostgreSQL),
- vector embeddings/indexes (pgvector initially, pluggable vector backend later),
- blob/object storage for uploaded and processed source artifacts.

Abstraction rule:
- application code depends on interfaces (`BlobStorage`, `VectorIndex`, `DocumentStore`) rather than vendor SDKs directly.

Backends by deployment:
- SaaS: managed Postgres + managed object storage,
- single-tenant AWS: dedicated RDS/Aurora + S3,
- private cloud: customer-managed Postgres + S3-compatible storage,
- on-prem future: local object store/S3-compatible gateway + local DB cluster.

---

## 18) AI Provider Abstraction Strategy (Deployment-Aware)

Provider abstraction remains mandatory across all topologies.

Runtime requirements:
- select provider per tenant/workspace policy,
- support fallback routing (for example local provider first, remote provider fallback where allowed),
- capture provider/model details in audit and observability records.

Deployment implications:
- SaaS: mix of commercial providers and optional private endpoints,
- single-tenant/private cloud: customer-selected provider endpoints and networking controls,
- on-prem future: local inference runtime as primary provider.

---

## 19) Database Migration Strategy

Goals:
- zero/low-downtime migration flow for production environments,
- deterministic schema history across shared and dedicated deployments.

Policy:
- use forward-only versioned migrations,
- separate migration execution from application startup in production,
- run pre-deploy compatibility checks and post-deploy validation,
- include rollback/mitigation playbooks for destructive changes.

Operational model:
- SaaS: migration pipeline with guarded rollout and monitoring,
- single-tenant/private cloud: migration job per environment with approval gates,
- on-prem future: signed migration bundles and documented operator runbooks.

---

## 20) MVP Scope Guardrails

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

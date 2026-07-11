# AI Business Assistant Platform - System Context Diagram

This diagram shows system boundaries and external dependencies across evolution stages.

## Mermaid System Context Diagram (C4-style simplified)

```mermaid
flowchart TB
    U[Business User] --> WEB[Web App\nReact + Vite + TS + MUI]
    A[Company Admin] --> WEB

    WEB --> API[NestJS API\nModular Monolith]

    API --> PG[(PostgreSQL + pgvector)]
    API --> FS[(Local File Storage\nV1)]
    API --> OLLAMA[Ollama Runtime\nLLM + Embedding]

    API --> LOGS[(AI Request Log Store\nin PostgreSQL)]

    subgraph Future Connectors
      NOTION[Notion]
      CONF[Confluence]
      SP[SharePoint]
      GDRIVE[Google Drive]
      GH[GitHub]
      WEBURL[Website URLs]
    end

    NOTION -.future connector.-> API
    CONF -.future connector.-> API
    SP -.future connector.-> API
    GDRIVE -.future connector.-> API
    GH -.future connector.-> API
    WEBURL -.future connector.-> API

    subgraph Future AI Providers
      OPENAI[OpenAI]
      ANTH[Anthropic]
      AZURE[Azure OpenAI]
      PRIVATE[Private Model Server]
    end

    API -.provider abstraction.-> OPENAI
    API -.provider abstraction.-> ANTH
    API -.provider abstraction.-> AZURE
    API -.provider abstraction.-> PRIVATE
```

---

## Deployment Evolution Context

### V1 (current target)
- Single local deployment on developer machine
- Local Ollama + local Postgres/pgvector
- PDF upload as first source type

### Shared SaaS (future)
- Shared multi-tenant web/api runtime
- Managed database and storage
- Hosted AI providers and/or managed inference

### Enterprise dedicated (future)
- Per-customer isolated deployment:
  - dedicated backend
  - dedicated database/vector store
  - dedicated model runtime/provider connection

The same domain model and module boundaries are preserved across stages to avoid rewrites.

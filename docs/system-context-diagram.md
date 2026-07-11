# AI Business Assistant Platform - System Context Diagram

This context diagram models the platform as an enterprise knowledge and automation system.

## Mermaid System Context Diagram

```mermaid
flowchart TB
    U[Business User] --> WEB[Web App\nReact + Vite + TypeScript]
    A[Company Admin] --> WEB

    WEB --> API[NestJS Platform API\nModular Monolith]

    API --> AGENT[Agent Orchestrator]
    AGENT --> TOOLS[Tool Framework]
    AGENT --> KE[Knowledge Engine]
    AGENT --> LLM[AI Provider Gateway]

    KE --> PG[(PostgreSQL + pgvector)]
    KE --> STORE[(Knowledge Storage\nLocal FS in MVP)]

    TOOLS --> WEBSEARCH[Web Search Provider]
    TOOLS --> INTAPI[Internal APIs]
    TOOLS --> EXTAPI[External APIs]
    TOOLS --> DBTOOLS[Databases]

    API --> CONNECTORS[Connector Runtime]
    CONNECTORS --> PDF[PDF Source - MVP]

    CONNECTORS -.future.-> NOTION[Notion]
    CONNECTORS -.future.-> CONF[Confluence]
    CONNECTORS -.future.-> SP[SharePoint]
    CONNECTORS -.future.-> GDRIVE[Google Drive]
    CONNECTORS -.future.-> ONEDRIVE[OneDrive]
    CONNECTORS -.future.-> GH[GitHub]
    CONNECTORS -.future.-> JIRA[Jira]
    CONNECTORS -.future.-> SLACK[Slack]
    CONNECTORS -.future.-> TEAMS[Microsoft Teams]
    CONNECTORS -.future.-> EMAIL[Email]
    CONNECTORS -.future.-> RESTSRC[REST API Sources]
    CONNECTORS -.future.-> GQLSRC[GraphQL API Sources]
    CONNECTORS -.future.-> SQLSRC[SQL Databases]

    LLM --> OLLAMA[Ollama - MVP]
    LLM -.future.-> OPENAI[OpenAI]
    LLM -.future.-> ANTH[Anthropic]
    LLM -.future.-> AZURE[Azure OpenAI]
    LLM -.future.-> PRIVATE[Private LLM Server]

    API --> LOG[(AI Request Log / Audit Store)]
```

---

## Deployment Evolution Context

### MVP: Single Local Deployment
- single runtime on developer machine
- Postgres + pgvector + Ollama locally
- PDF connector, knowledge engine, chat, tool framework, web search tool

### Future: Shared SaaS
- shared multi-tenant control plane and execution runtime
- managed storage, AI provider routing, and operations

### Enterprise: Dedicated Deployment per Company
- dedicated backend runtime
- dedicated database/vector infrastructure
- dedicated connector credentials and policy boundaries
- optional dedicated/private model connectivity

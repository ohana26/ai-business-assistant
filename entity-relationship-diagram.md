# AI Business Assistant Platform - Entity Relationship Diagram

This ERD reflects the enterprise knowledge + automation architecture:
- knowledge-centric domain model,
- assistant-to-knowledge-base reuse,
- agent/tool execution traces,
- complete AI observability.

## Mermaid ER Diagram

```mermaid
erDiagram
    COMPANY ||--o{ USER : has
    COMPANY ||--o{ WORKSPACE : has
    COMPANY ||--o{ AI_REQUEST_LOG : owns

    WORKSPACE ||--o{ WORKSPACE_MEMBER : has
    USER ||--o{ WORKSPACE_MEMBER : joins

    WORKSPACE ||--o{ KNOWLEDGE_BASE : contains
    KNOWLEDGE_BASE ||--o{ COLLECTION : contains
    COLLECTION ||--o{ KNOWLEDGE_SOURCE : groups
    KNOWLEDGE_SOURCE ||--o{ KNOWLEDGE_ITEM : produces
    KNOWLEDGE_ITEM ||--o{ KNOWLEDGE_CHUNK : split_into

    WORKSPACE ||--o{ ASSISTANT : has
    ASSISTANT ||--o{ ASSISTANT_KNOWLEDGE_BASE : uses
    KNOWLEDGE_BASE ||--o{ ASSISTANT_KNOWLEDGE_BASE : connected_to

    ASSISTANT ||--o{ CONVERSATION : answers
    USER ||--o{ CONVERSATION : asks
    CONVERSATION ||--o{ CONVERSATION_SOURCE : cites
    KNOWLEDGE_CHUNK ||--o{ CONVERSATION_SOURCE : referenced_by

    ASSISTANT ||--o{ AGENT_RUN : orchestrates
    AGENT_RUN ||--o{ TOOL_EXECUTION : executes
    TOOL_DEFINITION ||--o{ TOOL_EXECUTION : defines
    TOOL_DEFINITION ||--o{ TOOL_CREDENTIAL : uses

    ASSISTANT ||--o{ AI_REQUEST_LOG : serves
    USER ||--o{ AI_REQUEST_LOG : triggers
    CONVERSATION ||--o{ AI_REQUEST_LOG : traces
    AGENT_RUN ||--o{ AI_REQUEST_LOG : logs
```

---

## Relationship Notes

1. `KnowledgeSource` abstracts all connector types, with PDF as MVP implementation.
2. `KnowledgeItem` provides a canonical normalized representation of ingested content from any source.
3. `AssistantKnowledgeBase` supports many-to-many reuse between assistants and knowledge bases.
4. `AgentRun` and `ToolExecution` capture the orchestration lifecycle and tool invocation history.
5. `AIRequestLog` stores intent, selected tools, retrieved knowledge, prompts, responses, and errors.

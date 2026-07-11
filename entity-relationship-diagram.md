# AI Business Assistant Platform - Entity Relationship Diagram

This ERD reflects the updated architecture:
- Company -> Workspace -> Knowledge Base -> Collection -> Document -> Chunk
- Assistants consume knowledge bases (many-to-many)
- AI request logs capture full retrieval and generation trace

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

    WORKSPACE ||--o{ ASSISTANT : has
    ASSISTANT ||--o{ ASSISTANT_KNOWLEDGE_BASE : uses
    KNOWLEDGE_BASE ||--o{ ASSISTANT_KNOWLEDGE_BASE : linked_to

    KNOWLEDGE_BASE ||--o{ KNOWLEDGE_SOURCE : ingests_from
    COLLECTION ||--o{ KNOWLEDGE_SOURCE : optional_scope

    KNOWLEDGE_SOURCE ||--o{ DOCUMENT : syncs
    COLLECTION ||--o{ DOCUMENT : groups
    DOCUMENT ||--o{ DOCUMENT_CHUNK : split_into

    ASSISTANT ||--o{ CONVERSATION : answers
    USER ||--o{ CONVERSATION : asks
    CONVERSATION ||--o{ CONVERSATION_SOURCE : cites
    DOCUMENT_CHUNK ||--o{ CONVERSATION_SOURCE : referenced_by

    ASSISTANT ||--o{ AI_REQUEST_LOG : serves
    USER ||--o{ AI_REQUEST_LOG : triggers
    CONVERSATION ||--o{ AI_REQUEST_LOG : traces
```

---

## Relationship Notes

1. `ASSISTANT_KNOWLEDGE_BASE` enables one assistant to use multiple knowledge bases and one knowledge base to serve multiple assistants.
2. Documents are owned by knowledge structures (knowledge base/collection), not assistants.
3. `KNOWLEDGE_SOURCE` abstracts connector types (PDF now, others later).
4. `AI_REQUEST_LOG` is a core observability entity for enterprise debugging and quality tracking.

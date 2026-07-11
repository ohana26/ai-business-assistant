# Enterprise AI Knowledge Platform - Domain Model

This document defines the **business domain model** and bounded contexts, independent of ORM implementation.

---

## 1) Domain Overview

The platform consists of six primary bounded contexts:

1. **Identity & Access**
2. **Workspace Management**
3. **Knowledge Management**
4. **Assistant Configuration**
5. **Agent Execution & Observability**
6. **Subscription & Usage (future-ready)**

The strategic model is:

`User -> Membership -> Company -> Workspace -> (Knowledge, Assistants, Agents, Tools)`

---

## 2) Bounded Contexts

## A) Identity & Access Context

### Entities
- User
- Company
- Membership
- Role
- Permission
- WorkspaceMembership

### Why this structure
- Supports future multi-company users.
- Prevents hard-coding user-to-company one-to-one assumptions.
- Enables fine-grained company and workspace authorization.

---

## B) Workspace Management Context

### Entities
- Workspace

### Why this structure
- Creates sub-tenant boundaries for departments/business units.
- Supports independent assistants, knowledge spaces, and governance per workspace.

---

## C) Knowledge Management Context

### Entities
- KnowledgeBase
- Collection
- KnowledgeSource
- KnowledgeAsset
- DocumentMetadata
- Chunk
- Embedding

### Why this structure
- Handles files and non-file data uniformly.
- Keeps connector-specific ingest concerns separate from retrieval units.
- Allows multiple embeddings for the same chunk over time.

---

## D) Assistant Configuration Context

### Entities
- Assistant
- AIConfiguration
- AssistantKnowledgeBase
- Tool
- AssistantTool

### Why this structure
- Assistants can combine multiple knowledge bases and tools.
- Configuration can be reused and versioned.
- Provider settings are isolated from runtime request logs.

---

## E) Agent Execution & Observability Context

### Entities
- Conversation
- Message
- AIRequest
- AgentExecution
- ToolExecution
- RetrievedContext

### Why this structure
- Full observability for debugging and governance.
- Separates user conversation history from orchestration internals.
- Makes “why did AI answer this way?” auditable.

---

## F) Subscription & Usage Context (Future)

### Entities
- Plan
- Subscription
- UsageRecord

### Why this structure
- Keeps monetization concerns isolated.
- Supports metering and quotas without changing core domains.
- Enables gradual billing rollout later.

---

## 3) Aggregate Boundaries (Recommended)

Potential aggregate roots:
- Identity aggregate: `User`, `Membership`
- Tenant aggregate: `Company`, `Workspace`
- Knowledge aggregate: `KnowledgeBase`, `Collection`, `KnowledgeSource`, `KnowledgeAsset`
- Assistant aggregate: `Assistant`, `AssistantKnowledgeBase`, `AssistantTool`, `AIConfiguration`
- Agent aggregate: `AIRequest`, `AgentExecution`, `ToolExecution`, `RetrievedContext`
- Conversation aggregate: `Conversation`, `Message`

Notes:
- Keep `AIRequest` and `Conversation` separate aggregates to avoid large write contention and oversized transactions.
- Keep ingestion (`KnowledgeAsset`) separate from retrieval artifacts (`Chunk`, `Embedding`) for asynchronous processing.

---

## 4) Invariants and Rules

1. Every workspace belongs to exactly one company.
2. Every workspace operation must resolve through membership + workspace membership.
3. Assistants can only attach knowledge bases/tools in allowed tenant scope.
4. AI requests and tool executions must store trace metadata.
5. Retrieved context records should only reference tenant-consistent knowledge.
6. Soft-deleted entities are excluded from normal reads.

---

## 5) Lifecycle States (Representative)

- Membership: `PENDING`, `ACTIVE`, `REMOVED`
- Workspace/KnowledgeBase/Assistant: `ACTIVE`, `ARCHIVED`
- KnowledgeSource sync: `PENDING`, `SYNCING`, `READY`, `FAILED`
- KnowledgeAsset ingest: `UPLOADED`, `PROCESSING`, `READY`, `FAILED`
- AIRequest/AgentExecution: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`
- Subscription: `TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELED`

---

## 6) Main Architectural Decisions

1. **Membership over direct company FK on user**  
   Enables true multi-company participation and future B2B collaboration.
2. **KnowledgeAsset abstraction**  
   Avoids file-only design and supports APIs/databases/messages as first-class knowledge.
3. **Separate AIRequest vs Conversation**  
   Better observability and cleaner operational analytics.
4. **Assistant as composition root**  
   Assistant binds AI configuration + knowledge bases + tools.
5. **Trace-first model**  
   Agent/tool/retrieval entities enable enterprise debugging and compliance.

---

## 7) Tradeoffs

1. **Higher initial schema complexity**  
   More tables than MVP-only systems, but significantly better extensibility.
2. **More joins for authorization and retrieval**  
   Membership + workspace models add query complexity; indexes are essential.
3. **Storage growth from observability**  
   AIRequest/ToolExecution/RetrievedContext can grow quickly; archival policies will be needed.
4. **Flexible JSON fields reduce strictness**  
   Useful early, but should be gradually normalized as patterns stabilize.

---

## 8) Recommended Implementation Order

1. Identity + authorization core (`User`, `Company`, `Membership`, roles/permissions)
2. Workspace core (`Workspace`, `WorkspaceMembership`)
3. Knowledge ingestion core (`KnowledgeBase`, `Collection`, `KnowledgeSource`, `KnowledgeAsset`)
4. Retrieval core (`Chunk`, `Embedding`)
5. Assistant composition (`Assistant`, `AIConfiguration`, linking tables)
6. Agent runtime traces (`Conversation`, `Message`, `AIRequest`, `AgentExecution`, `ToolExecution`, `RetrievedContext`)
7. Subscription + usage metering (future phase)

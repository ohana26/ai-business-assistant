# AI Business Assistant Platform - Database Schema Design

This schema supports:
- Multi-company tenancy with workspace boundaries
- Reusable knowledge bases consumed by multiple assistants
- Collection-based document organization
- Replaceable source connectors and AI pipeline observability

---

## 1) Design Principles

1. **Tenant-first**: all tenant-owned entities carry `company_id`
2. **Workspace-bounded**: operational resources are scoped to `workspace_id`
3. **Reusable knowledge**: assistants reference knowledge bases; they do not own documents
4. **Traceable AI**: every answer can be tied to retrieved chunks and prompt/model metadata
5. **MVP focus**: no billing/payments/SSO entities in core MVP schema

---

## 2) Core Domain Entities

## Company
- `id` (uuid, pk)
- `name` (text, not null)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz)

## User
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `email` (citext/text, not null)
- `password_hash` (text, not null)
- `role` (enum: `OWNER`, `ADMIN`, `MEMBER`)
- `created_at`, `updated_at`

Suggested unique constraints:
- unique (`company_id`, `email`)

## Workspace
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `name` (text, not null)
- `description` (text)
- `created_at`, `updated_at`

Suggested unique constraints:
- unique (`company_id`, `name`)

## WorkspaceMember (recommended)
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, fk -> workspace.id, indexed)
- `user_id` (uuid, fk -> user.id, indexed)
- `workspace_role` (enum/text: `WORKSPACE_ADMIN`, `WORKSPACE_MEMBER`)
- `created_at`

Suggested unique constraints:
- unique (`workspace_id`, `user_id`)

## KnowledgeBase
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, fk -> workspace.id, indexed)
- `name` (text, not null)
- `description` (text)
- `status` (enum: `ACTIVE`, `ARCHIVED`)
- `created_at`, `updated_at`

Suggested unique constraints:
- unique (`workspace_id`, `name`)

## Collection
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, fk -> knowledge_base.id, indexed)
- `name` (text, not null)
- `description` (text)
- `created_at`, `updated_at`

Suggested unique constraints:
- unique (`knowledge_base_id`, `name`)

## Assistant
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, fk -> workspace.id, indexed)
- `name` (text, not null)
- `description` (text)
- `default_system_prompt` (text)
- `retrieval_config` (jsonb)         # topK, threshold, collection filters, etc.
- `provider_config` (jsonb)          # provider/model settings per assistant
- `created_at`, `updated_at`

Suggested unique constraints:
- unique (`workspace_id`, `name`)

## AssistantKnowledgeBase (many-to-many)
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed)
- `knowledge_base_id` (uuid, fk -> knowledge_base.id, indexed)
- `is_primary` (boolean, default false)
- `created_at`

Suggested unique constraints:
- unique (`assistant_id`, `knowledge_base_id`)

## KnowledgeSource
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, indexed)
- `collection_id` (uuid, fk -> collection.id, indexed, nullable)
- `source_type` (enum: `PDF`, `DOCX`, `TXT`, `WEBSITE`, `NOTION`, `CONFLUENCE`, `SHAREPOINT`, `GOOGLE_DRIVE`, `GITHUB`)
- `display_name` (text)
- `source_config` (jsonb)            # URI/path/connector config
- `sync_mode` (enum/text: `MANUAL`, `SCHEDULED`, `WEBHOOK`)
- `status` (enum: `ACTIVE`, `DISABLED`, `ERROR`)
- `last_synced_at` (timestamptz, nullable)
- `created_at`, `updated_at`

Notes:
- PDF is the only implemented source in MVP; other types are schema-ready.

## Document
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, indexed)
- `collection_id` (uuid, fk -> collection.id, indexed)
- `knowledge_source_id` (uuid, fk -> knowledge_source.id, indexed)
- `filename` (text, not null)
- `mime_type` (text)
- `storage_path` (text)              # local path now, object key later
- `checksum` (text)
- `status` (enum: `UPLOADED`, `PROCESSING`, `READY`, `FAILED`)
- `error_message` (text)
- `created_at`, `updated_at`

Indexes:
- (`company_id`, `workspace_id`, `status`)
- (`knowledge_base_id`, `collection_id`)

## DocumentChunk
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, indexed)
- `collection_id` (uuid, indexed)
- `document_id` (uuid, fk -> document.id, indexed)
- `chunk_index` (int, not null)
- `content` (text, not null)
- `token_count` (int)
- `embedding` (vector(N))            # dimension based on embedding model
- `metadata` (jsonb)                 # page, headings, char offsets, etc.
- `created_at` (timestamptz, default now)

Indexes:
- vector index on `embedding` (HNSW/IVFFlat)
- btree (`company_id`, `workspace_id`, `knowledge_base_id`)
- btree (`collection_id`)
- unique (`document_id`, `chunk_index`)

## Conversation
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed)
- `user_id` (uuid, fk -> user.id, indexed)
- `question` (text, not null)
- `answer` (text, not null)
- `created_at` (timestamptz, default now)

## ConversationSource
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `conversation_id` (uuid, fk -> conversation.id, indexed)
- `document_id` (uuid, fk -> document.id)
- `chunk_id` (uuid, fk -> document_chunk.id)
- `similarity_score` (float)
- `citation_text` (text)

Purpose:
- Stores exact evidence used for each answer

## AIRequestLog
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed, nullable)
- `user_id` (uuid, fk -> user.id, indexed, nullable)
- `conversation_id` (uuid, fk -> conversation.id, indexed, nullable)
- `question` (text, not null)
- `retrieved_chunks` (jsonb, not null)      # ids + scores + snippets
- `retrieved_documents` (jsonb, not null)   # document references
- `prompt` (text, not null)
- `provider` (text, not null)               # ollama/openai/etc
- `model` (text, not null)
- `response` (text, not null)
- `latency_ms` (int, not null)
- `prompt_tokens` (int, nullable)
- `completion_tokens` (int, nullable)
- `total_tokens` (int, nullable)
- `feedback` (enum/text: `POSITIVE`, `NEGATIVE`, `NONE`, nullable)
- `created_at` (timestamptz, default now)

Indexes:
- (`company_id`, `workspace_id`, `created_at`)
- (`assistant_id`, `created_at`)

---

## 3) Tenant and Workspace Isolation Rules

Required checks:
- Every tenant-owned table stores `company_id`
- Workspace-owned resources store `workspace_id`
- Repository queries include:
  - `WHERE company_id = :companyId`
  - `AND workspace_id = :workspaceId` when applicable

Cross-entity consistency:
- `workspace.company_id == company.id`
- `knowledge_base.workspace_id == workspace.id`
- `collection.knowledge_base_id == knowledge_base.id`
- `document.collection_id` belongs to same knowledge base/workspace
- `assistant_knowledge_base` references same company/workspace for both sides

Optional future hardening:
- PostgreSQL RLS by company/workspace

---

## 4) Enums for MVP and Future-Ready Design

### UserRole
- `OWNER`
- `ADMIN`
- `MEMBER`

### DocumentStatus
- `UPLOADED`
- `PROCESSING`
- `READY`
- `FAILED`

### KnowledgeSourceType
- `PDF`
- `DOCX`
- `TXT`
- `WEBSITE`
- `NOTION`
- `CONFLUENCE`
- `SHAREPOINT`
- `GOOGLE_DRIVE`
- `GITHUB`

### FeedbackStatus
- `POSITIVE`
- `NEGATIVE`
- `NONE`

---

## 5) Prisma and pgvector Notes

- Use UUIDs for entity identifiers
- Use `Json` for flexible `provider_config`, `retrieval_config`, and request logs
- Enable pgvector via raw migration:
  - `CREATE EXTENSION IF NOT EXISTS vector;`
- Keep vector search queries in repository-level raw SQL where necessary

---

## 6) Relationship Summary

- Company 1..n Users
- Company 1..n Workspaces
- Workspace 1..n KnowledgeBases
- KnowledgeBase 1..n Collections
- Collection 1..n Documents
- Document 1..n DocumentChunks
- Workspace 1..n Assistants
- Assistant n..m KnowledgeBases (via AssistantKnowledgeBase)
- KnowledgeSource 1..n Documents
- Assistant 1..n Conversations
- Conversation 1..n ConversationSources
- Conversation 0..n AIRequestLogs (or request logs directly per Q/A request)

---

## 7) Performance and Scalability Considerations

1. Filter early by tenant/workspace/knowledge-base/collection before vector search
2. Use HNSW index for fast local and medium-scale retrieval
3. Keep citation metadata with chunk/document references for quick response assembly
4. Add partitioning (e.g., by workspace or time) when data volume grows
5. Introduce async ingestion workers for high document throughput

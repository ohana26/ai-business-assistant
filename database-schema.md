# AI Business Assistant Platform - Database Schema Design

This schema is designed for:
- Multi-tenant company isolation
- RAG workflows with vector search
- Auditability and future billing/analytics expansion

---

## 1) Design Principles

1. **Tenant-first modeling**: tenant-owned tables include `company_id`
2. **Traceable RAG**: each answer can map back to source chunks/documents
3. **Status-driven pipelines**: document processing uses explicit statuses
4. **Future-ready**: billing and analytics can be added without major refactor

---

## 2) Core Entities

## Company
- `id` (uuid, pk)
- `name` (text, not null)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz)

## User
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `email` (citext/text, unique)
- `password_hash` (text, not null)
- `role` (enum: `OWNER`, `ADMIN`, `MEMBER`)
- `created_at`, `updated_at`

Constraint suggestions:
- unique (`company_id`, `id`) implicit by PK + FK path
- optional unique (`company_id`, `email`) if emails can repeat across tenants

## Assistant
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `name` (text, not null)
- `description` (text)
- `ai_provider` (text, e.g. `ollama`)
- `ai_model` (text, e.g. `llama3.1`)
- `embedding_model` (text, e.g. `nomic-embed-text`)
- `system_prompt` (text)
- `retrieval_config` (jsonb)   # e.g. topK, threshold, maxContextTokens
- `created_at`, `updated_at`

Unique suggestions:
- unique (`company_id`, `name`) for clean UX

## Document
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed)
- `filename` (text, not null)
- `mime_type` (text)
- `storage_path` (text)         # local path now, object storage key later
- `status` (enum: `UPLOADED`, `PROCESSING`, `READY`, `FAILED`)
- `error_message` (text)
- `checksum` (text)             # duplicate detection
- `created_at`, `updated_at`

Indexes:
- (`company_id`, `assistant_id`, `status`)
- (`company_id`, `created_at`)

## DocumentChunk
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `document_id` (uuid, fk -> document.id, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed)
- `chunk_index` (int, not null)
- `content` (text, not null)
- `token_count` (int)
- `embedding` (vector(N))       # pgvector, N depends on embedding model
- `metadata` (jsonb)            # page number, heading, char range, etc.
- `created_at` (timestamptz)

Indexes:
- vector index on `embedding` (HNSW or IVFFlat depending on scale)
- btree (`company_id`, `assistant_id`)
- unique (`document_id`, `chunk_index`)

## Conversation
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed)
- `user_id` (uuid, fk -> user.id, indexed)
- `question` (text, not null)
- `answer` (text, not null)
- `model_used` (text)
- `latency_ms` (int)
- `created_at` (timestamptz, default now)

Note:
- For future multi-turn threads, add `conversation_thread` + `message` tables.

## ConversationSource (recommended companion table)
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `conversation_id` (uuid, fk -> conversation.id, indexed)
- `document_id` (uuid, fk -> document.id)
- `chunk_id` (uuid, fk -> document_chunk.id)
- `score` (float)
- `citation_text` (text)

Purpose:
- Stores exact chunks used for each answer for traceability

## Subscription (future)
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, unique)
- `plan` (enum/text: `FREE`, `PRO`, `ENTERPRISE`)
- `status` (enum/text: `ACTIVE`, `PAST_DUE`, `CANCELED`, `TRIAL`)
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `created_at`, `updated_at`

---

## 3) Tenant Isolation Rules

Apply to all tenant data:
- Include `company_id`
- Repository queries must include `WHERE company_id = :companyId`
- Validate cross-entity consistency:
  - document.assistant_id belongs to same company
  - chunk.document_id belongs to same company
  - conversation entities belong to same company

Optional future hardening:
- PostgreSQL Row-Level Security (RLS) policies per company

---

## 4) Prisma Modeling Notes

- Use `@db.Uuid` for IDs (Postgres)
- Use `Json` type for flexible configs/metadata
- For pgvector:
  - Use raw SQL migrations for extension/indexes
  - Prisma handles scalar data; vector operations can be in repository raw queries

Suggested migration prerequisites:
- `CREATE EXTENSION IF NOT EXISTS vector;`
- vector indexes on `document_chunk.embedding`

---

## 5) Initial ER Relationship Summary

- Company 1..n Users
- Company 1..n Assistants
- Company 1..n Documents
- Assistant 1..n Documents
- Document 1..n DocumentChunks
- Assistant 1..n Conversations
- User 1..n Conversations
- Conversation 1..n ConversationSources
- Company 1..1 Subscription (future)

---

## 6) Suggested Status Enums

### DocumentStatus
- `UPLOADED`
- `PROCESSING`
- `READY`
- `FAILED`

### UserRole
- `OWNER`
- `ADMIN`
- `MEMBER`

### SubscriptionStatus (future)
- `TRIAL`
- `ACTIVE`
- `PAST_DUE`
- `CANCELED`

---

## 7) Performance and Scalability Considerations

1. Start with moderate chunk counts and HNSW index for fast local retrieval
2. Keep embeddings and metadata in same table for simplified retrieval path
3. Add partitioning by `company_id` or `created_at` when scale grows
4. Archive old conversations/doc versions for cost control
5. Introduce async ingestion queue when document volume increases

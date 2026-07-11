# AI Business Assistant Platform - Database Schema Design

This schema supports an Enterprise AI Knowledge and Automation Platform:
- workspace-scoped knowledge management,
- connector-driven ingestion,
- knowledge engine retrieval,
- agent orchestration and tools,
- and full AI request traceability.

---

## 1) Design Principles

1. **Tenant isolation**: all tenant-owned data includes `company_id`
2. **Workspace isolation**: operational entities include `workspace_id`
3. **Knowledge-centric model**: assistants consume knowledge, do not own it
4. **Agent + tool readiness**: schema supports multi-tool execution traces
5. **Provider agnosticism**: model/provider selection is configuration data
6. **MVP realism**: only PDF connector is implemented; broader source catalog is architecture-ready

---

## 2) Core Tenancy and Identity Entities

## Company
- `id` (uuid, pk)
- `name` (text, not null)
- `created_at`, `updated_at`

## User
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `email` (text/citext, not null)
- `password_hash` (text, not null)
- `role` (enum: `OWNER`, `ADMIN`, `MEMBER`)
- `created_at`, `updated_at`

Suggested constraints:
- unique (`company_id`, `email`)

## Workspace
- `id` (uuid, pk)
- `company_id` (uuid, fk -> company.id, indexed)
- `name` (text, not null)
- `description` (text)
- `created_at`, `updated_at`

Suggested constraints:
- unique (`company_id`, `name`)

## WorkspaceMember
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, fk -> workspace.id, indexed)
- `user_id` (uuid, fk -> user.id, indexed)
- `workspace_role` (enum/text: `WORKSPACE_ADMIN`, `WORKSPACE_MEMBER`)
- `created_at`

Suggested constraints:
- unique (`workspace_id`, `user_id`)

---

## 3) Knowledge Management Entities

## KnowledgeBase
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `name` (text)
- `description` (text)
- `status` (enum: `ACTIVE`, `ARCHIVED`)
- `created_at`, `updated_at`

## Collection
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, fk -> knowledge_base.id, indexed)
- `name` (text)
- `description` (text)
- `created_at`, `updated_at`

## KnowledgeSource
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, fk -> knowledge_base.id, indexed)
- `collection_id` (uuid, fk -> collection.id, indexed, nullable)
- `connector_type` (enum: see source types below)
- `display_name` (text)
- `source_uri` (text, nullable)
- `source_config` (jsonb)              # connector-specific settings
- `auth_config_ref` (text, nullable)   # reference to encrypted credentials/secrets
- `sync_mode` (enum/text: `MANUAL`, `SCHEDULED`, `EVENT_DRIVEN`)
- `sync_status` (enum: `PENDING`, `SYNCING`, `READY`, `FAILED`)
- `last_synced_at` (timestamptz, nullable)
- `created_at`, `updated_at`

## KnowledgeItem
Canonical normalized knowledge object independent of source format.
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, indexed)
- `collection_id` (uuid, indexed, nullable)
- `knowledge_source_id` (uuid, fk -> knowledge_source.id, indexed)
- `title` (text)
- `mime_type` (text)
- `raw_location` (text, nullable)      # file path, URL, object key, etc.
- `checksum` (text, nullable)
- `status` (enum: `UPLOADED`, `PROCESSING`, `READY`, `FAILED`)
- `metadata` (jsonb)                   # source-native metadata
- `created_at`, `updated_at`

## KnowledgeChunk
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `knowledge_base_id` (uuid, indexed)
- `collection_id` (uuid, indexed, nullable)
- `knowledge_item_id` (uuid, fk -> knowledge_item.id, indexed)
- `chunk_index` (int, not null)
- `content` (text, not null)
- `token_count` (int, nullable)
- `embedding` (vector(N))
- `rank_score` (float, nullable)
- `metadata` (jsonb)                   # page, section, timestamps, speaker, etc.
- `created_at`

Indexes:
- vector index on `embedding` (HNSW/IVFFlat)
- btree (`company_id`, `workspace_id`, `knowledge_base_id`)
- btree (`collection_id`)
- unique (`knowledge_item_id`, `chunk_index`)

---

## 4) Assistant, Agent, and Tool Entities

## Assistant
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `name` (text, not null)
- `description` (text)
- `default_system_prompt` (text)
- `provider_config` (jsonb)            # model/provider defaults
- `agent_config` (jsonb)               # tool permissions, orchestration rules
- `created_at`, `updated_at`

## AssistantKnowledgeBase
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, fk -> assistant.id, indexed)
- `knowledge_base_id` (uuid, fk -> knowledge_base.id, indexed)
- `is_primary` (boolean, default false)
- `created_at`

## ToolDefinition
- `id` (uuid, pk)
- `company_id` (uuid, indexed, nullable)     # null for global/platform tools
- `workspace_id` (uuid, indexed, nullable)
- `name` (text, not null)
- `tool_type` (enum: `KNOWLEDGE_SEARCH`, `WEB_SEARCH`, `REST_API`, `DATABASE_QUERY`, `CALCULATOR`, `EMAIL`, `CALENDAR`, `CRM`, `ERP`, `MCP`, `CUSTOM`)
- `description` (text)
- `config_schema` (jsonb)                    # expected input/output schema hints
- `execution_config` (jsonb)                 # endpoint/query/runtime settings
- `status` (enum: `ACTIVE`, `DISABLED`)
- `created_at`, `updated_at`

## ToolCredential
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed, nullable)
- `tool_definition_id` (uuid, fk -> tool_definition.id, indexed)
- `credential_ref` (text, not null)          # secret reference, not raw secret
- `created_at`, `updated_at`

## Conversation
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, indexed)
- `user_id` (uuid, indexed)
- `question` (text)
- `answer` (text)
- `created_at`

## ConversationSource
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `conversation_id` (uuid, indexed)
- `knowledge_item_id` (uuid, indexed, nullable)
- `knowledge_chunk_id` (uuid, indexed, nullable)
- `similarity_score` (float, nullable)
- `citation_text` (text, nullable)

## AgentRun
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, indexed)
- `conversation_id` (uuid, indexed, nullable)
- `user_id` (uuid, indexed, nullable)
- `question` (text, not null)
- `intent` (text, not null)
- `execution_plan` (jsonb, not null)
- `status` (enum: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`)
- `started_at`, `ended_at`

## ToolExecution
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `agent_run_id` (uuid, fk -> agent_run.id, indexed)
- `tool_definition_id` (uuid, fk -> tool_definition.id, indexed)
- `input_payload` (jsonb)
- `output_payload` (jsonb, nullable)
- `status` (enum: `PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`, `SKIPPED`)
- `error_message` (text, nullable)
- `started_at`, `ended_at`

---

## 5) Observability and Traceability Entities

## AIRequestLog
- `id` (uuid, pk)
- `company_id` (uuid, indexed)
- `workspace_id` (uuid, indexed)
- `assistant_id` (uuid, indexed, nullable)
- `user_id` (uuid, indexed, nullable)
- `conversation_id` (uuid, indexed, nullable)
- `agent_run_id` (uuid, indexed, nullable)
- `question` (text, not null)
- `intent` (text, not null)
- `selected_tools` (jsonb, not null)
- `retrieved_knowledge` (jsonb, not null)
- `prompt` (text, not null)
- `provider` (text, not null)
- `model` (text, not null)
- `response` (text, nullable)
- `latency_ms` (int, nullable)
- `prompt_tokens` (int, nullable)
- `completion_tokens` (int, nullable)
- `total_tokens` (int, nullable)
- `errors` (jsonb, nullable)
- `feedback` (enum/text: `POSITIVE`, `NEGATIVE`, `NONE`, nullable)
- `created_at` (timestamptz, default now)

Indexes:
- (`company_id`, `workspace_id`, `created_at`)
- (`assistant_id`, `created_at`)
- (`agent_run_id`)

---

## 6) Connector and Source Type Enumeration

`KnowledgeSourceType` / `connector_type` values:
- `PDF`
- `DOCX`
- `TXT`
- `MARKDOWN`
- `EXCEL`
- `POWERPOINT`
- `CSV`
- `IMAGE_OCR`
- `AUDIO_TRANSCRIPT`
- `VIDEO_TRANSCRIPT`
- `WEBSITE`
- `NOTION`
- `CONFLUENCE`
- `SHAREPOINT`
- `GOOGLE_DRIVE`
- `ONEDRIVE`
- `GITHUB`
- `JIRA`
- `SLACK`
- `MICROSOFT_TEAMS`
- `EMAIL`
- `SQL_DATABASE`
- `REST_API`
- `GRAPHQL_API`
- `CUSTOM`

MVP implementation:
- `PDF` only

---

## 7) Tenant and Workspace Isolation Rules

Required constraints:
- all tenant entities include `company_id`
- workspace-owned entities include `workspace_id`
- all repository queries enforce scoped predicates

Consistency checks:
- workspace belongs to company
- knowledge base belongs to workspace/company
- collection/source/item/chunk share same company/workspace lineage
- assistant and linked knowledge bases belong to same workspace
- tool executions and agent runs stay in workspace boundary

Optional hardening:
- PostgreSQL RLS policies for company/workspace

---

## 8) Relationship Summary

- Company 1..n Users
- Company 1..n Workspaces
- Workspace 1..n KnowledgeBases
- KnowledgeBase 1..n Collections
- Collection 1..n KnowledgeSources
- KnowledgeSource 1..n KnowledgeItems
- KnowledgeItem 1..n KnowledgeChunks
- Workspace 1..n Assistants
- Assistant n..m KnowledgeBases (via AssistantKnowledgeBase)
- Assistant 1..n AgentRuns
- AgentRun 1..n ToolExecutions
- ToolDefinition 1..n ToolExecutions
- Assistant 1..n Conversations
- Conversation 1..n ConversationSources
- AIRequestLog links conversation, assistant, and agent runs for full traceability

---

## 9) Prisma and Storage Notes

- Use UUID primary keys and JSON columns for extensible configs
- Enable `pgvector` with raw migration SQL
- Keep vector similarity queries in repository-level raw SQL where needed
- Store connector credentials in secret manager; DB keeps references only

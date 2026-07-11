# Enterprise AI Knowledge Platform - Database Schema Design

This document defines the **database design blueprint** (not ORM code) for an enterprise-ready SaaS platform.

It is designed for:
- multi-tenant SaaS with strict company isolation,
- workspace segmentation,
- reusable knowledge systems,
- assistant + agent orchestration,
- tool execution tracing,
- future subscription and usage billing.

---

## 1) Core Design Principles

1. **Membership-based identity**  
   Users are not directly attached to a single company. Access is granted through memberships.
2. **Tenant isolation by company**  
   All tenant-owned operational entities include `company_id`.
3. **Workspace boundary inside company**  
   Most runtime entities also include `workspace_id`.
4. **Knowledge abstraction first**  
   Do not assume all sources are files; model sources and assets generically.
5. **Traceability by default**  
   AI requests, retrievals, tool calls, and messages are persisted for audit/debug.
6. **Soft-deletion friendly**  
   Business entities support `deleted_at` for recovery and compliance workflows.

---

## 2) Cross-Cutting Column Conventions

Recommended on nearly all business entities:
- `id` (uuid, pk)
- `created_at` (timestamptz, not null)
- `updated_at` (timestamptz, not null)
- `deleted_at` (timestamptz, nullable, for soft delete)

Tenant columns:
- `company_id` required for tenant-owned records.
- `workspace_id` required for workspace-owned records.

---

## 3) Identity Domain

## User
- **Purpose**: Global user identity across companies.
- **Main fields**:
  - `id`, `email` (global unique), `password_hash`
  - `display_name`, `avatar_url`
  - `status` (`ACTIVE`, `INVITED`, `SUSPENDED`)
  - timestamps + soft delete
- **Relationships**:
  - 1..n `Membership`
  - 1..n `Conversation`, `Message`, `AIRequest`, `AgentExecution`
- **Important indexes**:
  - unique (`email`)
  - (`status`)
- **Multi-tenant considerations**:
  - user exists outside company; tenant access always resolved through membership.

## Company
- **Purpose**: Primary tenant boundary.
- **Main fields**:
  - `id`, `name`, `slug`, `status`
  - `settings_json` (policy/config)
  - timestamps + soft delete
- **Relationships**:
  - 1..n `Membership`
  - 1..n `Workspace`
  - 1..n tenant-scoped operational entities
- **Important indexes**:
  - unique (`slug`)
  - (`status`)
- **Multi-tenant considerations**:
  - primary data partition key.

## Membership
- **Purpose**: User-company association with role and lifecycle.
- **Main fields**:
  - `id`, `user_id`, `company_id`
  - `role_id` (or role enum reference)
  - `status` (`PENDING`, `ACTIVE`, `REMOVED`)
  - `invited_by_user_id`, `joined_at`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `User`
  - n..1 `Company`
  - n..1 `Role`
  - 1..n `WorkspaceMembership`
- **Important indexes**:
  - unique (`user_id`, `company_id`) where `deleted_at is null`
  - (`company_id`, `status`)
- **Multi-tenant considerations**:
  - canonical tenant access record.

## Role
- **Purpose**: Reusable permission bundle (company-level or platform-level).
- **Main fields**:
  - `id`, `company_id` (nullable for global default roles)
  - `name`, `description`, `is_system_role`
  - timestamps + soft delete
- **Relationships**:
  - 1..n `Membership`
  - n..m `Permission` (via `RolePermission`)
- **Important indexes**:
  - unique (`company_id`, `name`) where `deleted_at is null`
- **Multi-tenant considerations**:
  - supports tenant custom roles and shared defaults.

## Permission
- **Purpose**: Atomic authorization capability.
- **Main fields**:
  - `id`, `key` (e.g., `knowledge.read`), `description`, timestamps
- **Relationships**:
  - n..m with `Role` via `RolePermission`
- **Important indexes**:
  - unique (`key`)
- **Multi-tenant considerations**:
  - typically platform-scoped dictionary.

## RolePermission
- **Purpose**: Role-to-permission join table.
- **Main fields**:
  - `role_id`, `permission_id`, timestamps
- **Important indexes**:
  - unique (`role_id`, `permission_id`)

## WorkspaceMembership
- **Purpose**: Workspace-level access derived from company membership.
- **Main fields**:
  - `id`, `membership_id`, `workspace_id`
  - `workspace_role` (`ADMIN`, `MEMBER`, `VIEWER`)
  - timestamps + soft delete
- **Important indexes**:
  - unique (`membership_id`, `workspace_id`) where `deleted_at is null`

---

## 4) Workspace Domain

## Workspace
- **Purpose**: Sub-tenant boundary (e.g., HR, Engineering, Support).
- **Main fields**:
  - `id`, `company_id`
  - `name`, `slug`, `description`
  - `status`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `Company`
  - 1..n `KnowledgeBase`, `Assistant`, runtime entities
- **Important indexes**:
  - unique (`company_id`, `slug`) where `deleted_at is null`
  - (`company_id`, `status`)
- **Multi-tenant considerations**:
  - all workspace data must match workspace.company_id lineage.

---

## 5) Knowledge Domain

## KnowledgeBase
- **Purpose**: Curated knowledge container within workspace.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`
  - `name`, `description`, `status`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `Workspace`
  - 1..n `Collection`, `KnowledgeSource`, `KnowledgeAsset`
  - n..m with `Assistant` via `AssistantKnowledgeBase`
- **Important indexes**:
  - unique (`workspace_id`, `name`) where `deleted_at is null`
  - (`company_id`, `workspace_id`, `status`)

## Collection
- **Purpose**: Logical grouping for filtering/retrieval policies.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `knowledge_base_id`
  - `name`, `description`, `status`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `KnowledgeBase`
  - 1..n `KnowledgeAsset`
- **Important indexes**:
  - unique (`knowledge_base_id`, `name`) where `deleted_at is null`
  - (`company_id`, `workspace_id`, `knowledge_base_id`)

## KnowledgeSource
- **Purpose**: Connector configuration and sync boundary (not necessarily a file).
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `knowledge_base_id`
  - `collection_id` (nullable default target)
  - `source_type` (`PDF`, `DOCX`, `EXCEL`, `CSV`, `WEBSITE`, `API`, `DATABASE`, etc.)
  - `display_name`, `source_ref` (URI/id), `config_json`
  - `auth_ref` (secret manager reference)
  - `sync_mode`, `sync_status`, `last_synced_at`, `last_error`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `KnowledgeBase`
  - 1..n `KnowledgeAsset`
- **Important indexes**:
  - (`company_id`, `workspace_id`, `source_type`)
  - (`knowledge_base_id`, `sync_status`)

## KnowledgeAsset
- **Purpose**: Canonical ingested unit from any source (file, web page, API record, DB rowset snapshot).
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `knowledge_base_id`, `knowledge_source_id`
  - `collection_id` (nullable)
  - `asset_type` (`FILE`, `WEB_PAGE`, `API_OBJECT`, `DB_RECORDSET`, `MESSAGE`, etc.)
  - `title`, `external_id`, `version_hash`
  - `mime_type` (nullable), `storage_uri` (nullable)
  - `metadata_json`
  - `ingestion_status`, `ingested_at`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `KnowledgeSource`
  - 1..n `Chunk`, `DocumentMetadata`
- **Important indexes**:
  - (`company_id`, `workspace_id`, `knowledge_base_id`)
  - (`knowledge_source_id`, `external_id`)
  - (`ingestion_status`)

## DocumentMetadata
- **Purpose**: File/document-specific details for assets that are files.
- **Main fields**:
  - `id`, `knowledge_asset_id`
  - `filename`, `file_extension`, `file_size_bytes`
  - `checksum`, `page_count` (nullable), `language` (nullable)
  - timestamps + soft delete
- **Relationships**:
  - n..1 `KnowledgeAsset`
- **Important indexes**:
  - unique (`knowledge_asset_id`) where `deleted_at is null`
  - (`checksum`)

## Chunk
- **Purpose**: Retrieval unit generated from a knowledge asset.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `knowledge_base_id`, `knowledge_asset_id`
  - `collection_id` (nullable)
  - `chunk_index`, `content`, `token_count`
  - `metadata_json` (page/section/time range/speaker)
  - timestamps + soft delete
- **Relationships**:
  - n..1 `KnowledgeAsset`
  - 1..n `Embedding`
  - n..m retrieval references via `RetrievedContext`
- **Important indexes**:
  - unique (`knowledge_asset_id`, `chunk_index`) where `deleted_at is null`
  - (`company_id`, `workspace_id`, `knowledge_base_id`)

## Embedding
- **Purpose**: Vector representation for a chunk (supports multi-model re-embedding).
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `chunk_id`
  - `provider`, `model`, `dimension`
  - `vector` (pgvector)
  - `is_active`, timestamps + soft delete
- **Relationships**:
  - n..1 `Chunk`
- **Important indexes**:
  - (`chunk_id`, `is_active`)
  - (`company_id`, `workspace_id`, `provider`, `model`)
  - vector index on `vector` (HNSW/IVFFlat)

---

## 6) Assistant Domain

## Assistant
- **Purpose**: Configured AI assistant inside workspace.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`
  - `name`, `description`, `status`
  - `system_prompt`
  - `ai_configuration_id`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `Workspace`
  - n..m `KnowledgeBase` via `AssistantKnowledgeBase`
  - n..m `Tool` via `AssistantTool`
  - 1..n `Conversation`, `AIRequest`, `AgentExecution`
- **Important indexes**:
  - unique (`workspace_id`, `name`) where `deleted_at is null`
  - (`company_id`, `workspace_id`, `status`)

## AIConfiguration
- **Purpose**: Provider/model/runtime settings reused by assistants.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`
  - `provider` (`OLLAMA`, `OPENAI`, `ANTHROPIC`, etc.)
  - `model`, `temperature`, `max_tokens`
  - `embedding_provider`, `embedding_model`
  - `config_json`
  - timestamps + soft delete
- **Relationships**:
  - 1..n `Assistant`
- **Important indexes**:
  - (`company_id`, `workspace_id`, `provider`, `model`)

## AssistantKnowledgeBase
- **Purpose**: Attach multiple knowledge bases to assistant.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`
  - `assistant_id`, `knowledge_base_id`
  - `priority`, `is_default`
  - timestamps + soft delete
- **Important indexes**:
  - unique (`assistant_id`, `knowledge_base_id`) where `deleted_at is null`
  - (`company_id`, `workspace_id`)

## Tool
- **Purpose**: Executable tool definition (knowledge search, web search, API, DB, etc.).
- **Main fields**:
  - `id`, `company_id`, `workspace_id` (nullable for global tools)
  - `name`, `tool_type`, `description`
  - `input_schema_json`, `output_schema_json`
  - `execution_config_json`, `status`
  - timestamps + soft delete
- **Relationships**:
  - n..m with assistants via `AssistantTool`
  - 1..n `ToolExecution`
- **Important indexes**:
  - unique (`workspace_id`, `name`) where `deleted_at is null`
  - (`tool_type`, `status`)

## AssistantTool
- **Purpose**: Assistant-specific tool enablement and policy.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`
  - `assistant_id`, `tool_id`
  - `is_enabled`, `policy_json`
  - timestamps + soft delete
- **Important indexes**:
  - unique (`assistant_id`, `tool_id`) where `deleted_at is null`

---

## 7) Agent Domain

## Conversation
- **Purpose**: Thread container for user-assistant interaction.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `assistant_id`, `user_id`
  - `title`, `status`
  - timestamps + soft delete
- **Relationships**:
  - 1..n `Message`
  - 1..n `AIRequest`
- **Important indexes**:
  - (`assistant_id`, `created_at`)
  - (`user_id`, `created_at`)

## Message
- **Purpose**: Individual turn in conversation (user/system/assistant/tool).
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `conversation_id`
  - `role` (`USER`, `ASSISTANT`, `SYSTEM`, `TOOL`)
  - `content`, `metadata_json`
  - `created_by_user_id` (nullable), `created_by_tool_id` (nullable)
  - timestamps + soft delete
- **Important indexes**:
  - (`conversation_id`, `created_at`)

## AIRequest
- **Purpose**: One orchestrated request lifecycle for debugging/audit.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `assistant_id`, `conversation_id`, `user_id`
  - `question`, `intent`
  - `final_prompt`, `model_provider`, `model_name`
  - `response_text`, `status`, `error_json`
  - `latency_ms`, `prompt_tokens`, `completion_tokens`, `total_tokens`
  - `feedback` (`POSITIVE`, `NEGATIVE`, `NONE`)
  - timestamps + soft delete
- **Relationships**:
  - 1..n `AgentExecution`, `RetrievedContext`
- **Important indexes**:
  - (`company_id`, `workspace_id`, `created_at`)
  - (`assistant_id`, `created_at`)
  - (`status`)

## AgentExecution
- **Purpose**: Planner/executor run associated with one AI request.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `ai_request_id`
  - `plan_json`, `execution_status`
  - `started_at`, `ended_at`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `AIRequest`
  - 1..n `ToolExecution`
- **Important indexes**:
  - (`ai_request_id`, `execution_status`)

## ToolExecution
- **Purpose**: Trace one tool call within agent execution.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `agent_execution_id`, `tool_id`
  - `step_index`, `input_json`, `output_json`
  - `status`, `error_message`
  - `started_at`, `ended_at`
  - timestamps + soft delete
- **Relationships**:
  - n..1 `AgentExecution`
  - n..1 `Tool`
- **Important indexes**:
  - (`agent_execution_id`, `step_index`)
  - (`tool_id`, `created_at`)

## RetrievedContext
- **Purpose**: Evidence records for what knowledge was used.
- **Main fields**:
  - `id`, `company_id`, `workspace_id`, `ai_request_id`
  - `knowledge_base_id`, `knowledge_asset_id`, `chunk_id`, `embedding_id` (nullable)
  - `retrieval_score`, `rank`, `citation_text`
  - `retrieval_method` (`VECTOR`, `HYBRID`, `KEYWORD`, etc.)
  - timestamps + soft delete
- **Relationships**:
  - n..1 `AIRequest`
  - references knowledge entities
- **Important indexes**:
  - (`ai_request_id`, `rank`)
  - (`chunk_id`)

---

## 8) Subscription Domain (Future-Ready)

## Plan
- **Purpose**: Plan catalog (FREE/PRO/ENTERPRISE).
- **Main fields**:
  - `id`, `code`, `name`, `description`
  - `limits_json` (assistants, storage, requests, etc.)
  - timestamps + soft delete
- **Important indexes**:
  - unique (`code`)

## Subscription
- **Purpose**: Company plan assignment and lifecycle.
- **Main fields**:
  - `id`, `company_id`, `plan_id`
  - `status` (`TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELED`)
  - `starts_at`, `ends_at`, `trial_ends_at`
  - `billing_provider_ref` (nullable)
  - timestamps + soft delete
- **Relationships**:
  - n..1 `Company`, n..1 `Plan`
  - 1..n `UsageRecord`
- **Important indexes**:
  - (`company_id`, `status`)
  - (`plan_id`, `status`)

## UsageRecord
- **Purpose**: Metered usage for future billing/quotas.
- **Main fields**:
  - `id`, `company_id`, `workspace_id` (nullable), `subscription_id`
  - `metric_key` (`ai_request`, `embedding_tokens`, `storage_bytes`, etc.)
  - `quantity`, `recorded_at`
  - `source_entity_type`, `source_entity_id`
  - timestamps + soft delete
- **Important indexes**:
  - (`company_id`, `metric_key`, `recorded_at`)
  - (`subscription_id`, `recorded_at`)

---

## 9) Tenant Isolation and Consistency Rules

Mandatory consistency checks:
- workspace.company_id == company.id
- all workspace entities share the same `company_id` + `workspace_id`
- assistant links only to knowledge bases/tools in same workspace (unless explicit global tool policy)
- retrieved contexts only reference chunks/assets from same tenant boundary

Query rules:
- all queries include tenant filter (`company_id`)
- workspace-level APIs include `workspace_id`
- soft-deleted rows excluded by default (`deleted_at is null`)

Hardening options:
- PostgreSQL Row Level Security (RLS)
- tenant-aware DB roles for enterprise-dedicated environments

---

## 10) Recommended First Implementation Order (Schema Layer)

1. Identity foundation: `User`, `Company`, `Membership`, `Role`, `Permission`
2. Workspace layer: `Workspace`, `WorkspaceMembership`
3. Knowledge core: `KnowledgeBase`, `Collection`, `KnowledgeSource`, `KnowledgeAsset`
4. Retrieval core: `Chunk`, `Embedding`
5. Assistant core: `AIConfiguration`, `Assistant`, linking tables
6. Agent tracing: `Conversation`, `Message`, `AIRequest`, `AgentExecution`, `ToolExecution`, `RetrievedContext`
7. Subscription future layer: `Plan`, `Subscription`, `UsageRecord`

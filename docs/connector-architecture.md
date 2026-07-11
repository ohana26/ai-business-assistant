# Connector Architecture

## 1) Purpose

Connectors ingest knowledge from heterogeneous enterprise systems into a unified knowledge model.

The connector layer decouples source-specific logic from the core knowledge engine.

---

## 2) Connector Interface

Every connector implements:

`KnowledgeConnector`
- `authenticate()`
- `sync()`
- `extract()`
- `normalize()`
- `metadata()`

Optional advanced methods:
- `validateConfig()`
- `incrementalSync()`
- `healthCheck()`

---

## 3) Canonical Ingestion Flow

`Source -> Connector Auth -> Sync -> Extract -> Normalize -> Knowledge Item -> Chunk/Embed -> Index`

### Stage description
1. **authenticate**: validate and acquire connector access context
2. **sync**: fetch content from source (full or incremental)
3. **extract**: parse raw source artifacts into raw text/content blocks
4. **normalize**: map content into canonical `KnowledgeItem` schema
5. **metadata**: attach source metadata for traceability/filtering

---

## 4) Supported Source Types

Architecture-ready source catalog:
- PDF
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

MVP implementation:
- `PdfConnector` only

---

## 5) Connector Runtime Design

Core runtime components:
- `ConnectorRegistry`
- `ConnectorFactory`
- `ConnectorRunner`
- `SyncScheduler` (future background schedule support)
- `NormalizationService`
- `IngestionAuditLogger`

Execution model:
- connectors are selected by `connector_type`
- each run has status lifecycle (`PENDING`, `SYNCING`, `READY`, `FAILED`)
- each run emits structured logs and errors

---

## 6) Data and Metadata Standards

Each normalized knowledge item should include:
- source identity (connector type + source URI/id)
- workspace/knowledge base/collection ownership
- title/content payload
- source-native metadata (author, timestamps, page, channel, etc.)
- checksum/version fingerprint

This allows:
- incremental updates,
- deduplication,
- consistent citation behavior.

---

## 7) Security Model

- Connector credentials are never stored as raw secrets in primary tables
- Store only secure secret references
- Apply workspace-level connector permissions
- Log connector access and sync operations for auditability

---

## 8) Failure Handling

Connector runs must capture:
- failure stage (auth/sync/extract/normalize)
- error message and error code
- retry count
- last failure timestamp

Retry policy:
- transient errors retried with backoff
- validation/auth errors fail fast and require operator action

---

## 9) MVP Scope

MVP includes:
- connector interface definition
- PDF connector implementation
- manual sync trigger
- ingestion status and error visibility

MVP excludes:
- scheduled sync orchestration
- webhook/event-driven sync
- non-PDF connector implementations

# Agent Architecture

## 1) Purpose

The Agent Orchestrator is the decision and execution layer that turns a user request into the best combination of:
- knowledge retrieval,
- tool executions,
- and model generation.

It ensures the platform does not assume all answers come from RAG.

---

## 2) Core Responsibilities

1. Understand user intent
2. Decide execution strategy
3. Select and execute one or multiple tools
4. Query knowledge engine when needed
5. Compose intermediate results into final model context
6. Generate final response through provider abstraction
7. Return response with evidence and execution trace

---

## 3) Request Lifecycle

`Request -> Intent Classification -> Plan -> Tool/Knowledge Execution -> Result Composition -> Prompt Build -> LLM -> Post Processing -> Response`

Detailed stages:
1. **Intent Classification**
   - classify as knowledge query, web/current-events query, API operation, or hybrid
2. **Plan Builder**
   - produce structured execution plan with step ordering and fallbacks
3. **Tool Selector**
   - select allowed tools based on assistant policy and workspace permissions
4. **Execution Engine**
   - run one or more tool calls (sequential or parallel where safe)
5. **Knowledge Engine Invocation**
   - retrieve chunks when internal knowledge is needed
6. **Context Composer**
   - merge tool output + retrieved knowledge with provenance
7. **Prompt Builder**
   - build final prompt with grounding and policy constraints
8. **LLM Invocation**
   - call provider via abstraction
9. **Post Processor**
   - normalize output, attach citations/tool traces, and safety checks

---

## 4) Agent Components

- `IntentAnalyzer`
- `ExecutionPlanner`
- `PolicyGuard`
- `ToolRouter`
- `KnowledgeQueryAdapter`
- `ContextComposer`
- `PromptBuilder`
- `ResponsePostProcessor`
- `AgentTelemetryWriter`

All components should be replaceable through interfaces.

---

## 5) Planning and Execution Strategies

## Strategy types
- **Knowledge-first**: internal knowledge lookup first
- **Tool-first**: direct tool/API/web call first
- **Hybrid**: combine knowledge + tools then synthesize
- **Fallback**: if primary strategy fails, degrade gracefully

## Execution rules
- Prefer deterministic tool calls before speculative LLM-only answers
- Preserve provenance for every intermediate result
- Enforce timeout, retry, and failure handling per step

---

## 6) Security and Governance Controls

- Workspace-scoped tool allowlist
- Sensitive tool restrictions per assistant policy
- Input/output validation per tool
- PII-aware logging and redaction path
- Audit trail for all decisions and executions

---

## 7) Observability Requirements

Each agent run should persist:
- user question
- classified intent
- selected plan and tools
- retrieved knowledge references
- final prompt
- model/provider
- response
- errors
- latency and tokens
- user feedback

This is captured through `AgentRun`, `ToolExecution`, and `AIRequestLog`.

---

## 8) MVP Scope for Agent Layer

Implemented in MVP:
- intent classification (basic)
- plan selection between knowledge and web search
- tool execution path for web search tool
- knowledge engine path
- response synthesis and trace logging

Deferred:
- multi-step action automation
- long-running task agents
- human approval loops
- advanced planning/routing policies

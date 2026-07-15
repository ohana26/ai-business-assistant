# AGENTS.md

## Cursor Cloud specific instructions

### Repository state (important)
This repository is currently **documentation-only**. It contains architecture and
planning docs for a not-yet-implemented product ("AI Business Assistant Platform"):

- `README.md`
- `architecture.md`
- `database-schema.md`
- `development-roadmap.md`
- `entity-relationship-diagram.md`
- `system-context-diagram.md`

There is **no application code yet**: no `package.json`, no `apps/` or `src/`
directories, no build system, no lint config, and no test framework. The
`development-roadmap.md` lists "Start Phase 1 implementation" as the next step, so
the runtime stack described in the docs (NestJS API + React/Vite web +
PostgreSQL/pgvector + Ollama, orchestrated with Docker Compose) is **planned, not
built**.

Because of this:
- There is nothing to install, build, lint, test, or run as an application.
- The startup update script is intentionally a **no-op**. Do not add dependency
  installs to it until real code (e.g. a `package.json`) lands.

### Previewing the documentation (the current deliverable)
The Mermaid diagrams in `entity-relationship-diagram.md` and
`system-context-diagram.md` can be validated/rendered to images with mermaid-cli
(requires network for the one-time `npx` download; not part of the repo):

```
npx -y @mermaid-js/mermaid-cli@11 -i entity-relationship-diagram.md -o /tmp/erd.png
npx -y @mermaid-js/mermaid-cli@11 -i system-context-diagram.md -o /tmp/sysctx.png
```

### When real code is added
Once the monorepo skeleton exists (see `architecture.md` -> "Recommended Folder
Structure"), update the startup update script to install dependencies with the
package manager matching the committed lockfile, and document the actual
run/lint/test/build commands here.

# Frontend Application Foundation

Phase 1.2 frontend foundation for the Enterprise AI Knowledge Platform.

## Stack

- React
- Vite
- TypeScript
- Material UI
- React Router
- TanStack React Query
- Zustand
- Axios

## Structure

```text
src/
  components/common/   # shared UI building blocks
  layouts/             # app shells (dashboard layout)
  pages/               # route pages and placeholders
  features/            # domain modules (auth, dashboard, assistants, knowledge, chat, settings)
  services/            # API service clients and adapters
  hooks/               # reusable React hooks
  store/               # Zustand stores
  types/               # app and environment types
  utils/               # constants and utility helpers
  routes/              # route configuration
```

## Available Routes

- `/` -> Login placeholder
- `/dashboard` -> Dashboard placeholder
- `/knowledge` -> Knowledge placeholder
- `/assistants` -> Assistants placeholder
- `/chat` -> Chat placeholder
- `/settings` -> Settings placeholder

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Current variables:
- `VITE_API_BASE_URL` (default API base URL for Axios client)

## Run Locally

From repository root:

```bash
npm install
npm run dev -w frontend
```

Or from this directory:

```bash
npm install
npm run dev
```

## Quality Scripts

```bash
npm run lint
npm run build
```

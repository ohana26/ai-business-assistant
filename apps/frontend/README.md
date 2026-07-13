# AI Business Assistant Internal Console

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
  components/common/   # sidebar + top navigation
  layouts/             # authenticated app shell
  pages/               # Login, Dashboard, Knowledge, Chat
  routes/              # route table + protected route
  services/            # axios API client and endpoint functions
  store/               # auth and company/workspace context state
  hooks/               # app config utilities
  types/               # environment typings
```

## Implemented Routes

- `/login` -> email/password login (`POST /auth/login`)
- `/dashboard` -> company/workspace context setup
- `/knowledge` -> list/upload knowledge assets
- `/chat` -> assistant chat with source display

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Variables:
- `VITE_API_BASE_URL` (backend base URL, default `http://localhost:3000`)
- `VITE_DEFAULT_COMPANY_ID` (optional)
- `VITE_DEFAULT_WORKSPACE_ID` (optional)
- `VITE_DEFAULT_COLLECTION_ID` (optional)

## Run Locally

From repository root:

```bash
npm install
npm run dev -w frontend
```

Build:

```bash
npm run build -w frontend
```

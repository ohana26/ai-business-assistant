# Frontend Source Structure

- `components/` reusable UI components
  - `common/` shared presentational components used across pages
- `layouts/` application layouts (dashboard shell, future auth/public shells)
- `pages/` route-level pages
- `features/` domain-oriented feature modules
  - `auth/`, `dashboard/`, `assistants/`, `knowledge/`, `chat/`, `settings/`
- `services/` service layer integrations (Axios clients, future API modules)
- `hooks/` reusable React hooks
- `store/` Zustand stores for client-side state
- `types/` shared TypeScript types and environment declarations
- `utils/` framework-agnostic utility helpers and constants
- `routes/` router definitions and route composition

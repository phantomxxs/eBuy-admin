# eBuy Admin UI

Admin dashboard for the eBuy platform.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TanStack Router** — file-based routing
- **TanStack Query** — server state / data fetching
- **TanStack Form** — form management
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** (new-york, neutral) — component primitives
- **Zustand** — client state
- **Axios** — HTTP client
- **Recharts** — charts
- **Sonner** — toast notifications
- **Zod** — schema validation
- **Wrangler / Cloudflare Pages** — deployment

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start dev server on port 3000        |
| `pnpm build`        | Production build                     |
| `pnpm preview`      | Preview production build locally     |
| `pnpm test`         | Run unit tests (vitest)              |
| `pnpm format`       | Format code with Prettier            |
| `pnpm format:check` | Check formatting                     |
| `pnpm deploy`       | Build and deploy to Cloudflare Pages |

## Deployment

Deployed to Cloudflare Pages as `ebuy-admin-ui`.

```bash
pnpm deploy
```

Requires Wrangler to be authenticated (`wrangler login`).

## Project Structure

```
src/
├── components/
│   ├── ui/           # Project-level UI abstractions (wrapping shadcn primitives)
│   ├── AppLayout.tsx
│   ├── AppSidebar.tsx
│   └── AuthLayout.tsx
├── mock-data/        # Typed mock data arrays (used while real API is pending)
├── routes/           # TanStack Router file-based routes
├── services/
│   ├── apis.ts       # API URL constants
│   └── axios-instance.ts
├── store/
│   ├── queries/      # useQuery / useMutation hooks
│   ├── requests/     # Axios request functions
│   └── query-keys.ts
├── types/            # TypeScript interfaces per feature
└── lib/
    ├── routes.ts     # ROUTES constants — never hardcode paths
    └── utils.ts      # cn() helper
```

## Data Fetching Pattern

Every feature follows this chain:

```
types → mock-data → store/requests → store/queries → component hook
```

1. **`src/types/<feature>.ts`** — TypeScript interface
2. **`src/mock-data/<feature>.ts`** — typed mock array
3. **`src/store/requests/<feature>.ts`** — axios request (returns mock while building)
4. **`src/store/queries/<feature>.ts`** — `useQuery` / `useMutation` hook
5. **Component** — imports only the hook, never the request function directly

See [CLAUDE.md](CLAUDE.md) for the full conventions guide.

## Pages

| Route           | Description                              |
| --------------- | ---------------------------------------- |
| `/dashboard`    | Metrics, recent orders, chart, low stock |
| `/products`     | Product list, detail sheet, add modal    |
| `/orders`       | Order management                         |
| `/customers`    | Customer directory                       |
| `/promotions`   | Promotions and banners                   |
| `/locations`    | Store locations                          |
| `/banners`      | Banner management                        |
| `/users`        | Admin user management                    |
| `/inventory`    | Stock tracking                           |
| `/transactions` | Payment transactions                     |
| `/analytics`    | Activity logs                            |
| `/messaging`    | Announcements and SMS                    |
| `/settings`     | Store info, notifications, security      |

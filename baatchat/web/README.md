# Oblinor — Borrower Chat (web)

Vite + React + TypeScript SPA for the private borrower ⇄ investor chat. Deploys to
Cloudflare Pages (`dist/`, served at `https://chat.oblinor.no`) and talks to the backend
Worker (`https://oblinor-borrower-chat.bk-39a.workers.dev`) **only over `fetch`** — no DB
access, no secrets in the frontend.

## Run

```bash
pnpm install        # from the repo root (pnpm workspace)
pnpm --filter @oblinor/web dev      # http://localhost:5173
pnpm --filter @oblinor/web build    # → web/dist
pnpm --filter @oblinor/web test     # Vitest
```

Or from inside `web/`: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm typecheck`.

## Config

Copy `.env.example` → `.env` and adjust:

| Var              | Default                   | Purpose                                          |
| ---------------- | ------------------------- | ------------------------------------------------ |
| `VITE_API_BASE`  | `https://oblinor-borrower-chat.bk-39a.workers.dev` | Backend Worker base URL.       |
| `VITE_USE_MOCKS` | `true`                    | Use the in-app mock layer instead of the API.    |

Only `VITE_`-prefixed vars reach the browser. **Never put secrets here.**

## Stack

- **Vite + React + TS** SPA · **React Router** routing.
- **TanStack Query** for all server state · **Zustand** for the small client state
  (auth/session token).
- **react-hook-form + zod** for forms.
- **shadcn/ui + Tailwind CSS v4** for the UI (Radix primitives under the hood). The
  primitives live in `src/components/ui/` and we own/edit them directly.

## Structure

```
src/
  app/                # shell, router, providers, ProtectedRoute
  components/ui/       # shadcn primitives (button, input, card, form, select, …)
  features/
    auth/              # OTP login + registration, session store, api/, schemas
    dashboard/         # chat UI: icon rail + conversations + thread, threads api/
  lib/                 # apiClient (fetch wrapper), queryClient, env, utils
  mocks/               # fixtures + mock auth/dashboard implementations
  index.css            # Tailwind v4 entry + design tokens (single source of truth)
```

Co-locate by feature. Don't add abstraction layers before there are 2+ real uses.

## Design tokens

`src/index.css` is the single source of truth. Tokens are defined as CSS variables in
`:root` (a `.dark` block exists for later — **no dark-mode toggle is wired up**) and
mapped to Tailwind theme colors via `@theme inline`. Use semantic Tailwind classes
(`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`, …) — never raw
hex. Keyboard focus rings and WCAG AA contrast are built into the primitives.

## Auth — email + password

Email + password (matches the existing Oblinor portal login). Expected endpoints:

1. `POST /auth/login { email, password }` → `{ token, user }`.
2. `POST /auth/register { name, role, email, password }` → `{ token, user }`.
3. `POST /auth/forgot-password { email }` → emails a 6-digit reset code.
4. `POST /auth/reset-password { email, code, password }` → 200.
5. Authenticated requests send `Authorization: Bearer <jwt>`.

- **Login** = email + password (with show/hide + "Glemt passord?"). **Registration** =
  name + role (loaner | investor) + email + password.
- **Forgot password** is an in-place flow on the login screen: request a code → enter
  code + new password → done.
- The JWT lives in a Zustand store (`features/auth/store.ts`), persisted to
  `localStorage` and re-primed into `lib/apiClient` on load. `app/ProtectedRoute.tsx`
  guards `/dashboard`.
- **Mock mode:** with `VITE_USE_MOCKS=true` any email + password (≥ 8 chars) logs in; the
  password-reset code is always `123456` (shown as a hint in the UI).

## Swapping the mock layer for the real API

The mock/real boundary is a one-line switch per feature, keyed off `env.useMocks`:

- **Auth** — `features/auth/api/authApi.ts` exports `authApi = env.useMocks ? mockAuthApi
  : realAuthApi`. `realAuthApi` already calls the real endpoints (login / register /
  forgot-password / reset-password) via `lib/apiClient`. Set `VITE_USE_MOCKS=false` to use
  it; no caller changes needed.
- **Dashboard** — `features/dashboard/api/threads.ts` currently points both branches at
  `mockDashboardApi`. When the backend ships a threads endpoint, add a `realDashboardApi`
  that calls `apiClient.get("/threads")` and flip the ternary. The `useThreads()` hook
  stays the same.

All request/response shapes live in each feature's `api/types.ts`, so the typed contract
is the thing you implement against.

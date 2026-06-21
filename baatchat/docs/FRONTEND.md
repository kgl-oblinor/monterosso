# Frontend conventions (Phase 3)

The web app lives in **`web/`** as its own pnpm package. It is a Vite SPA deployed to
Cloudflare Pages (served at `https://chat.oblinor.no`) and talks to the backend Worker
(`https://oblinor-borrower-chat.bk-39a.workers.dev`) **only over `fetch`** — no DB
access, no secrets in the frontend.

## Stack (deliberately small — don't add more)
- **Vite + React + TypeScript** (SPA; `pnpm build` → `dist/` for Cloudflare Pages).
- **React Router** — routing.
- **TanStack Query** — all server state (~90% of needs).
- **Zustand** — small client state only (auth/session token, transient UI).
- **react-hook-form + zod** — form state + validation (keep schemas small).
- **shadcn/ui + Tailwind CSS v4** — styling. (Decision 2026-06-16, overriding the earlier
  "CSS Modules / build your own primitives" call.) Primitives live in
  `src/components/ui/` — we own and edit them directly; Radix UI provides the accessible
  behavior. No other UI kit.

## Structure — feature-based, co-locate by feature
```
web/src/
  app/                # shell, router, providers (QueryClient)
  components/ui/       # design-system primitives (Button, Input, Field, Card, ...)
  features/<feature>/  # components/ + api/ + store.ts, scoped to one feature
  lib/                 # apiClient (fetch wrapper), queryClient, env, utils
  index.css            # Tailwind v4 entry + design tokens — single source of truth
  mocks/               # fixtures + mock layer until backend endpoints exist
```

## Design tokens
`src/index.css` is the single source of truth: tokens are CSS variables in `:root`
(slate neutral ramp + primary + semantic aliases incl. success), mapped to Tailwind
theme colors via `@theme inline`. Components use semantic Tailwind classes
(`bg-background`, `text-muted-foreground`, `bg-primary`, …), never raw hex. The app runs
**dark** (`.dark` on `<html>`); the `:root` light values remain so a light theme / toggle
is possible later. WCAG AA contrast + visible keyboard focus on all interactive elements.

## Auth model — email + password, via account claim (matches the built backend)
Users are NOT open self-registration — they are existing Oblinor participants who *claim*
their account. There is no name/role field on the form: name + role come from the synced
Oblinor data. The 6-digit code proves the user owns the on-file email (org number alone
never grants access). Endpoints (live, tested):
- `POST /auth/register/start { email }` (investor) **or** `{ orgNumber }` (loaner)
  → `{ ok, sentTo }` where `sentTo` is the masked on-file email (or null — generic).
- `POST /auth/register/complete { email|orgNumber, code, password }`
  → `{ ok, token, user }`. Verifies the code, sets the password, creates the account.
- `POST /auth/login { email, password }` → `{ ok, token, user }`.
- `GET /auth/me` (Bearer) → `{ ok, user }`. Authenticated requests send `Authorization: Bearer <jwt>`.
- **Forgot/reset password** = just re-run the claim flow (`register/start` → `register/complete`);
  completing it again overwrites the password. No separate forgot/reset endpoints.

UI implications:
- **Login screen:** email + password (+ show/hide). "Glemt passord?" → kicks off the claim
  flow again (it doubles as reset).
- **Registration/claim screen:** a single identifier field — *email* for investors,
  *org number* for loaners (offer a role toggle that switches which field is shown) →
  "send code" → enter 6-digit code → set password. NO name field.
- JWT held in a Zustand store (persisted); attached as a Bearer header by the API client.
  Keep simple; harden later.

## Config
- `VITE_API_BASE` (default `https://oblinor-borrower-chat.bk-39a.workers.dev` — the
  backend Worker; the frontend itself is served at chat.oblinor.no). Never put secrets
  in the frontend.

## Polling (chat) — keep it frugal
v1 uses **polling, not WebSockets** (deliberate — see ROADMAP). The binding free-tier
limit is **Workers requests: 100,000/day**, and every poll is one request — so poll
sparingly:
- **Interval ~10s** for the open conversation (not 5s). Use TanStack Query's
  `refetchInterval`.
- **Pause when the tab is hidden/idle:** set `refetchIntervalInBackground: false` (don't
  poll a backgrounded tab), and/or gate polling on the Page Visibility API
  (`document.visibilityState`). This alone multiplies effective capacity.
- **Only poll the thread that's open** — never poll every thread at once. The thread
  *list* can refresh far less often (e.g. on window focus / every 30–60s).
- **Fetch deltas, not everything:** request messages since the last-seen id/timestamp
  (`GET /threads/:id/messages?since=<cursor>`), so each poll reads few rows.
- Back off when a conversation is idle (e.g. widen the interval after N empty polls).

Rationale: this keeps the app inside the free tier for early usage. If concurrent usage
grows, the fix is Workers Paid ($0.30 / million requests) or migrating the transport to
WebSockets + Durable Objects — the data model is unchanged, so that's a contained later
change, not a rewrite.

## Don't over-engineer (hard rules)
- No Redux/MobX/Recoil. No runtime UI kits (MUI/Ant/Chakra). shadcn/ui is allowed because
  its primitives are copied into the repo and owned here — keep them small and edit freely.
- No Next.js/SSR. No WebSockets (chat polls later).
- No design-system package, theming engine, Storybook, or i18n framework.
- Co-locate by feature; no premature abstraction (wait for 2+ real uses). Keep deps minimal.
- Tests: a couple for the login/OTP flow and a primitive or two. Don't chase coverage.

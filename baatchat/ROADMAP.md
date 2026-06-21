# Oblinor Borrower Chat — Roadmap & Mental Model

Keep this open. If a feature isn't on the phase list below, we don't build it yet.
Full design lives in `docs/CHAT_SYSTEM_PLAN.md`.

## The mental model: 3 pieces, 1 repo, 1 platform

```
  ┌─ FRONTEND ──────┐     ┌─ BACKEND ───────┐     ┌─ DATABASE ──┐
  │ React + Vite    │ →   │ Worker (Hono)   │ →   │ D1 (SQLite) │
  │ Cloudflare Pages│ ←   │ Cloudflare      │ ←   │ Cloudflare  │
  │ web/            │     │ src/worker/     │     │ migrations/ │
  └─────────────────┘     └─────────────────┘     └─────────────┘
        what the              the rules +            the data +
        user sees             the API                message history
```

- **DB** = the truth. Tables already written (`migrations/`). Created with `wrangler d1 create`.
- **Backend** = a single Worker. Checks "are you allowed?", reads/writes the DB, sends OTP emails.
  Already scaffolded (`src/worker/`); today only has `/health`.
- **Frontend** = a plain React app that calls the backend over `fetch`. Doesn't exist yet — Phase 3.

All three live in **one repo** and deploy to Cloudflare. We never run our own server.

## Anti-overengineering rules (pin these)

| We deliberately DON'T build in v1 | Why |
|---|---|
| WebSockets / Durable Objects | Polling every few seconds is enough, and free. |
| Passwords | Email code (OTP) only. Less to secure. |
| File attachments / push notifications | Text first. Add later *on purpose*. |
| Mirroring all of Oblinor | Only 4 tables of data we actually need. |
| Fancy state libraries everywhere | TanStack Query does 90%; Zustand for tiny bits. |
| Microservices | One Worker. One database. |

## The roadmap

**[DONE] Phase 0 — Scaffold.** Repo, DB schema, empty backend with `/health`, verified locally.

**[NEXT] Phase 0.5 — Go live (needs your Cloudflare login).**
You run `wrangler login`; then create D1 + KV, wire the ids into `wrangler.toml`,
migrate remote, deploy. Result: a live `/health` URL.

**Phase 1 — Pull data from Oblinor (backend only).**
Hourly sync Worker logs into Oblinor, pulls the minimal slice
(loaners / loans / orders / investors), upserts into D1.
*Blocker: confirm the WP bulk-users endpoint with the WordPress dev.*
Result: real eligibility data in D1, viewable with a SQL query.

**Phase 2 — Login + the API (backend only, no UI yet).**
Email OTP (`/auth/request-code` -> `/auth/verify-code` -> JWT), then chat endpoints
(`/contacts`, `/threads`, `/threads/:id/messages`). Test entirely with `curl`.
Result: a working API proven from the terminal before any pixels exist.

**Phase 3 — Frontend (the web app).**
React + Vite: login screen, thread list, conversation view with a composer that
polls for new messages. Deploy to Cloudflare Pages.
Conventions (stack, `web/` layout, design tokens, auth model): `docs/FRONTEND.md`.
Result: something you can click.

**Phase 4 — Watchdog + polish.**
Cloudflare Access in front of `/admin/*` for Oblinor staff (read/moderate);
offline-email notifications; mobile-friendly cleanup.

> Order on purpose: **data -> API -> UI.** Each phase is testable on its own
> (SQL query, then curl, then click). Never build a layer until the one under it is proven.

## How each piece gets set up

**Database (D1)** — infrastructure, runs once:
1. `wrangler d1 create oblinor_borrower_chat` -> gives an id, paste into `wrangler.toml`
2. `pnpm run db:migrate` -> runs the `.sql` files -> tables exist in the cloud
3. Schema change later: add `migrations/0003_*.sql`, run migrate again. Never hand-edit live tables.

**Backend (Worker)** — one file tree, one deploy:
1. Already there: `src/worker/index.ts` (Hono router).
2. Add files as phases need them: `auth.ts`, `chat.ts`, `sync.ts`, `admin.ts` — all imported into the one Worker.
3. `pnpm run dev` to test locally, `pnpm run deploy` to ship. Secrets via `wrangler secret put`.

**Frontend (Pages)** — Phase 3, a sub-folder:
1. `web/` created with Vite (`pnpm create vite`).
2. Talks to the backend over `fetch` only — no DB access, no secrets in it.
3. Connect the repo to Cloudflare Pages once; every push auto-builds and deploys.

## Where we are right now

Phase 0 done. **One command from you to start Phase 0.5:**

```sh
cd /Users/bamkadayat/Desktop/oblinor-borrower-chat && pnpm exec wrangler login
```

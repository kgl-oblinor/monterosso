# Oblinor Borrower Chat

Private 1-to-1 chat between property **låntakere** (borrowers) and **långivere**
(investors/lenders) on the Oblinor P2P lending platform, plus an admin console.
**100% Cloudflare**, polling-based.

- **Frontend:** `web/` — Vite + React + TS (shadcn/Tailwind), Cloudflare **Pages** → **https://chat.oblinor.no**
- **API:** `src/worker/` — Hono **Worker** + **D1** + **KV** → **https://oblinor-borrower-chat.bk-39a.workers.dev**
- Package manager: **pnpm** (workspace). Read `CLAUDE.md` before changing anything.

Data is **synced pull-only** from oblinor.no (loaners, investors, loans, orders); the
Worker is a read-mostly mirror. Design notes live in `docs/`.

## How it works

- **Claim / register** (`/login`, `/register`): an existing Oblinor investor (by email)
  or loaner (by org-nr) proves the on-file email via a 6-digit code, then sets a password.
- **Approval gate:** new accounts are `pending`. A loaner/investor can log in but
  **cannot chat until an admin approves them** — enforced on every chat request (API)
  and by the pending screen (UI). Admins approve in **/admin → Til godkjenning**.
- **Chat:** contacts are derived from shared loans/orders. Messages poll on an interval;
  500-word cap per message.
- **Admin (`/admin`):** låntaker/långiver directories, read-only conversation oversight,
  and **Epost** — compose a rich-text broadcast to loaners (with a loan) / investors
  (who invested) / both / a hand-picked set.
- **Admins** authenticate with allow-listed emails (`ADMIN_EMAILS`) + a shared
  `ADMIN_PASSWORD` secret. "Glemt passord?" emails a one-time code to an allow-listed
  address and logs them straight in (the shared secret is rotated by ops, not the UI).

## Local dev

```sh
pnpm install                       # repo root (workspace)

# API (Worker) — terminal 1
pnpm run dev                       # wrangler dev → http://localhost:8787

# Frontend — terminal 2
pnpm --filter @oblinor/web dev     # Vite → http://localhost:5173
```

`web/.env.local` (gitignored) points the frontend at an API; `web/.env.production`
(committed, public) is what CI builds with. Set `VITE_USE_MOCKS=true` to run the UI
against in-app mocks with no backend.

## Secrets (Cloudflare; never commit)

```sh
pnpm exec wrangler secret put CHAT_JWT_SECRET        # session JWT signing
pnpm exec wrangler secret put SENDGRID_API_KEY       # OTP + broadcast email
pnpm exec wrangler secret put ADMIN_PASSWORD         # shared admin login password
pnpm exec wrangler secret put OBLINOR_ADMIN_PASSWORD # WP service account (sync); user = OBLINOR_ADMIN_USERNAME var (git@oblinor.no)
pnpm exec wrangler secret put ADMIN_SYNC_KEY         # guards /admin/* sync triggers
```

Non-secret config lives in `wrangler.toml` (`ALLOWED_ORIGINS`, `ADMIN_EMAILS`,
`SENDGRID_FROM`, `OBLINOR_ADMIN_USERNAME`, D1/KV bindings). For local Worker dev,
put the secrets in `.dev.vars` (gitignored).

## Deploy

**Never deploy from your laptop.** Work on `main`, then merge `main → production` —
GitHub Actions (`.github/workflows/deploy.yml`) typechecks, deploys the **Worker**, then
**builds + deploys the Pages frontend**, and tags the release. `/version` reports the
live build number + commit.

```sh
git checkout main && git merge <feature> && git push        # land work on main
# open/merge a PR  main → production   (the merge is the deploy)
curl https://oblinor-borrower-chat.bk-39a.workers.dev/version
```

The CI token needs **Workers Scripts:Edit + Pages:Edit**. See `docs/DEPLOY.md`.

## Layout

```
wrangler.toml          Worker config — D1 + KV bindings, vars, workers.dev URL
migrations/            D1 SQL — 0001 synced slice, 0002 chat tables (threads/messages/read_state)
src/worker/            Hono API: index (routes/CORS), auth, chat, admin, broadcast, sync, wp, email
web/                   Vite + React frontend (features/auth, dashboard, admin)
docs/                  Design + deploy notes
CLAUDE.md              Rules for contributors / AI agents — READ FIRST
```

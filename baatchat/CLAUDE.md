# CLAUDE.md — Rules for AI agents and contributors

**READ THIS BEFORE CHANGING ANYTHING.** These rules override default assistant
behavior. They exist because this is a small, production system that syncs real
data from oblinor.no. The original author has handed it off — there is no one to
"ask later." When in doubt, **do nothing and leave a comment/question** instead
of guessing.

---

## 0. Golden rule: understand the whole context first

Before editing any file you MUST:

1. Read the file you are about to change **and** the files it imports/exports to.
2. Find the existing pattern for what you're doing (there almost always is one —
   see §3) and follow it exactly.
3. Make the **smallest change that solves the stated task.** Do not refactor,
   rename, reformat, "clean up," or "improve" code you were not asked to touch.
4. If the task seems to need a new pattern, a new dependency, or a design change,
   **STOP and ask the human first.** Do not proceed unilaterally.

Never make sweeping or repo-wide changes for a narrow request.

---

## 1. Do NOT install or add dependencies (hard rule)

- **Do not run `npm/pnpm/yarn add`, do not add anything to either
  `package.json`, do not introduce a new library** without explicit human
  approval in writing.
- The dependency list below is the **complete, intentional** set. Solve problems
  with what is already here.
- No new UI kits, CSS frameworks, state libraries, date libs, HTTP clients,
  icon packs, or "helper" utilities. We already have one for each job.

**Approved runtime dependencies (do not expand):**

| Need | Use this — nothing else |
|---|---|
| Backend framework | `hono` (Cloudflare Worker) |
| Frontend framework | `react` 19 + `react-dom` |
| Routing | `react-router-dom` v7 |
| Server state / data fetching | `@tanstack/react-query` (useQuery/useMutation) |
| Client/auth state | `zustand` |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` |
| Validation / schemas | `zod` |
| UI primitives | `@radix-ui/*` (shadcn-style) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) — utility classes only |
| Class merging | `clsx` + `tailwind-merge` via the `cn()` helper in `web/src/lib/utils.ts` |
| Variants | `class-variance-authority` |
| Icons | `lucide-react` — do not add other icon sets |

Package manager is **pnpm** (`pnpm@9.4.0`). Do not switch to npm/yarn.

---

## 2. Do NOT change the design / UI system (hard rule)

The UI is deliberate and consistent. Match it; do not redesign it.

- **Styling is Tailwind utility classes only.** No CSS Modules, no styled-
  components, no global stylesheets, no inline `style={}` except for truly
  dynamic values (e.g. a computed width).
- **Use the existing tokens and patterns.** The dark, Oblinor-branded theme uses
  the teal→navy radial gradient
  `bg-[radial-gradient(120%_120%_at_50%_0%,#134e4a_0%,#0a2a2e_42%,#020617_100%)]`
  on white text. Brand teal accents: `teal-400/15`, `teal-200`, `teal-600/70`.
  Reuse these — do not invent new color schemes.
- **Reuse existing components** in `web/src/components/ui/` and the per-feature
  `components/` folders (e.g. `AdminUI.tsx` exports `StatCard`, `StatusBadge`,
  `RowActions`, `Initials`). Do not duplicate them.
- **Loading states use the skeleton components** (`ChatSkeletons.tsx`,
  `components/ui/skeleton.tsx`), not spinners.
- **Norwegian (Bokmål) is the UI language.** All user-facing copy is Norwegian
  (Låntaker = borrower/loaner, Långiver = investor). Keep it that way and keep
  existing terminology consistent.
- New screens must visually match existing ones (sidebar + content layout,
  spacing, radii, bubble styles). If a design decision is genuinely needed,
  ask the human — do not freelance.

---

## 3. Follow the existing architecture & patterns

**Repo layout**
- `src/worker/` — Cloudflare Worker (Hono) API. One file per concern:
  `index.ts` (routes + `Env` + CORS), `auth.ts`, `chat.ts`, `admin.ts`,
  `sync.ts`, `wp.ts` (oblinor WordPress client), `kartverket.ts`, `email.ts`.
- `web/src/` — React frontend. Feature-first:
  `features/<feature>/{api,components}`, shared UI in `components/ui`, helpers in
  `lib/` (`apiClient.ts`, `utils.ts`).
- `migrations/` — D1 SQL migrations (additive; never edit a shipped migration).
- `docs/`, `ROADMAP.md` — context. Read them.

**Conventions to copy, not reinvent**
- Frontend never calls `fetch` directly — it goes through `web/src/lib/apiClient.ts`
  (which throws `ApiError` with a `.status`). Data lives in `features/*/api/*`
  hooks built on TanStack Query (polling via `refetchInterval`, `keepPreviousData`
  for pagination). Add new endpoints the same way.
- The Worker reads everything off the typed `Env` interface in `index.ts`. Add new
  config there. **Secrets are never hardcoded** (see §4).
- API base URL is configured via `web/.env*` (`VITE_API_BASE`). Do not hardcode
  hostnames in components.
- Data is **synced pull-only** from oblinor.no — the Worker is a read-mostly
  mirror. Do not write code that pushes data back to oblinor.

**Before adding an endpoint or hook:** find the nearest existing one and mirror
its shape (validation, error handling, return type, naming).

---

## 4. Secrets & security (hard rule)

- **Never put a secret value in the repo** — not in `wrangler.toml`, not in any
  `.env` that is committed, not in code, not in chat/PR text.
- Secrets live in **Cloudflare** (`wrangler secret put <NAME>`) and, for local
  dev only, in `.dev.vars` (gitignored). Current secrets:
  `CHAT_JWT_SECRET`, `SENDGRID_API_KEY`, `ADMIN_PASSWORD`,
  `OBLINOR_ADMIN_PASSWORD`, `ADMIN_SYNC_KEY`.
- If you discover a leaked credential, say so and rotate it — do not paste it.
- Do not loosen CORS (`ALLOWED_ORIGINS` in `wrangler.toml` + the origin function
  in `index.ts`), auth, or rate limits to "make something work." Ask first.

---

## 5. Workflow / safety

- **Never commit, push, or deploy unless explicitly asked.** Branch off
  `production` (the main branch for PRs is `production`) — do not commit straight
  to it.
- Run `pnpm typecheck` (root and `web/`) before proposing a change is done.
  Frontend tests: `pnpm --filter @oblinor/web test`.
- Never edit a migration that has already been applied — add a new one.
- Don't delete data, drop tables, or wipe conversations without explicit
  instruction.
- Deploys: `pnpm deploy` (Worker) / Pages build for `web/`. Don't deploy on a
  whim.

---

## 6. If you are unsure

Stop and ask. A small, correct, in-pattern change — or an honest "I'm not sure,
here are the options" — is always better than a confident wrong one. This system
is in production with real users and real synced data.

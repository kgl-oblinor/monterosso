# Lane C · Admin / captain inbox — PLAN

The captain (Kristian = admin) reads guest↔skipper chats and replies, one
thread per reservation code.

## Files (all new — Lane C only)

| File | Role |
|---|---|
| `app/admin/inbox/page.js` | Inbox index: all threads grouped by reservation code (server component). |
| `app/admin/[code]/page.js` | One thread: read + reply (server component + client `ThreadView`). |
| `components/admin/ThreadList.js` | Presentational list of threads. |
| `components/admin/ThreadView.js` | Client: message list + reply box, optimistic send. |
| `components/admin/admin-inbox.css` | Scoped styles (cream surfaces, Fraunces, sharp corners, 4px grid). |

> The inbox lives at **`/admin/inbox`**, not `/admin`, because
> `app/admin/page.js` already exists (the analytics dashboard) and Lane C
> must not edit existing files. See *Open questions* for merging.

## How it reads messages

Two complementary paths:

1. **Read (list + thread): direct D1.** The server components read Lane D's
   `messages` table straight from the Cloudflare D1 binding
   (`getCloudflareContext().env.DB`) — the same server-component pattern the
   existing `app/admin/page.js` already uses. This means the inbox works the
   moment the table exists, without waiting on Lane A's API to be deployed.

   - `inbox/page.js` → `SELECT code, sender, text, ts FROM messages ORDER BY ts`,
     then collapses rows into one thread per `code` (last message, time,
     running unread count of customer messages).
   - `[code]/page.js` → `SELECT … FROM messages WHERE code = ? ORDER BY ts`.
   - Name/contact are enriched best-effort from the existing `events` table
     (the booking enquiry carries phone/email per code). Degrades to "Gjest"
     if absent.

2. **Send (reply): Lane A's `/api/messages`.** `ThreadView` POSTs
   `{ code, sender: "captain", text }` to `/api/messages` and appends the
   reply optimistically. Writes go through the API so Lane A owns
   validation, dedup, and any downstream notification (WhatsApp/SMS to the
   guest).

### Contracts (verified against the landed Lane A/D files)

- **Lane D `messages` table** (`db/schema.sql`): `id` (TEXT uuid), `code`,
  `sender` (`customer | captain | admin`), `user_id`, `body`, `created`
  (ISO), `read_at` (nullable). Code = `MT-DDMMYY-<guests>`
  (`app/landing/Landing.js` `makeCode`). The admin reads alias
  `body → text` and `created → ts` for the components, and folds
  `admin → captain` for bubble alignment. Unread = customer messages with
  `read_at IS NULL`. Name joins `users.name` via `messages.user_id`.
- **Lane A `POST /api/messages`** (`app/api/messages/route.js`): body
  `{ code, sender, text }`, `sender ∈ {customer, captain}` →
  `201 { message: { id, sender, text, ts } }` (`ts` numeric ms). The
  optimistic bubble in ThreadView reconciles with the returned `message`.
  (The API stub is in-memory today; it has a TODO to back onto Lane D's
  `messages` table.)

> Mind the field-name split: Lane A's API speaks `text`/`ts`; Lane D's
> table stores `body`/`created`. Lane C reads the DB directly (so uses
> `body`/`created`) and sends via the API (so uses `text`). When Lane A
> wires its API to Lane D, both shapes still work here.

All DB reads are wrapped in try/catch and return empty on failure, so an
un-migrated table renders an empty inbox instead of a 500.

## Auth gate

Reuses the existing admin gate: `env.ADMIN_KEY` compared to `?key=…`
(see `app/admin/page.js`). Same secret → captain logs in once, the key is
carried in links/requests:

- Inbox and thread pages show a cream login form until `key === ADMIN_KEY`.
- The key is forwarded to `ThreadView` and sent as the `x-admin-key` header
  on reply POSTs, so Lane A can authorise captain sends.

> This is intentionally the same lightweight gate as the current admin
> page. If Lane B ships proper admin sessions, swap both gates for that.

## Open questions

1. **Two admin landing pages.** `/admin` (analytics) and `/admin/inbox`
   (chat) now coexist. Merge decision is Lane F/G's: either make `/admin`
   a hub linking to both, or fold analytics into Lane G's dashboard shell
   with chat as the default pane. Lane C did not touch `/admin`.
2. **`/api/messages` shape.** Confirm Lane A's request/response and auth
   header name (`x-admin-key` assumed) — adjust `ThreadView` if different.
3. **Customer name.** `messages`/`events` may not store a name. Currently
   falls back to "Gjest". If Lane B's `users` table has names keyed by
   contact, join on that.
4. **Unread tracking.** "Unread" is derived (customer messages since the
   last captain reply) — there is no read-receipt column. A `read_at` on
   `messages` would make it accurate.
5. **Live updates.** Threads are server-rendered per request (no polling).
   Fine for v1; add polling/SSE later if needed.

## Design

Own stylesheet `components/admin/admin-inbox.css` (globals.css /
landing.css are other lanes'). Solid cream `#f7f1e3`, `#efe7d4` hover,
Fraunces, radius 0, 4px spacing. Captain's bubbles align right. Comments
mark where Lane G's `components/dashboard/` shell (left sidebar: chat icon
top, profile bottom) should wrap these views.

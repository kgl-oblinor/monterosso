# Lane D — Data/DB plan (Cloudflare D1)

Data layer for the chat + light accounts. Single source of truth:

- `db/schema.sql` — all tables (`events`, `users`, `messages`) + indexes.
- `lib/db.js` — query helpers Lanes A/B/C call from their API routes.

## D1 binding (already configured)

`wrangler.jsonc` binds the database `monterosso-events` to `env.DB`:

```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "monterosso-events",
    "database_id": "f1aa73ed-ab1d-437f-9241-23e02c7a4130" }
]
```

In a route handler, get the handle with:

```js
import { getCloudflareContext } from "@opennextjs/cloudflare";
const { env } = getCloudflareContext();
const db = env?.DB; // may be undefined in local dev without the binding
```

`app/api/track/route.js` already does this and no-ops when `db` is missing —
chat/auth routes should degrade the same way (or return 503) in local dev.

## Applying the migration

The `events` table already exists in the live DB; the new tables are `users`
and `messages`. `schema.sql` uses `CREATE ... IF NOT EXISTS`, so applying the
whole file is safe and idempotent.

Remote (production D1):

```bash
npx wrangler d1 execute monterosso-events --remote --file=db/schema.sql
```

Local (the `.wrangler` simulated D1 used by `wrangler dev`):

```bash
npx wrangler d1 execute monterosso-events --local --file=db/schema.sql
```

Verify:

```bash
npx wrangler d1 execute monterosso-events --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table';"
```

> Krin (Lane F) runs these — Lane D does not run wrangler/npm itself.

## How it wires to the API routes

The reservation code (`MT-DDMMYY-<guests>`, from `Landing.js` `makeCode()`) is
the join key. There is no separate bookings table — booking lives in Stripe and
the `events` log — so `code` is a free-form TEXT key.

### Lane A — chat (`app/api/messages/**`)

- `POST /api/messages` → `addMessage(db, { code, sender, body, userId })`.
- `GET /api/messages?code=MT-...` → `listMessages(db, code)`.

### Lane B — onboarding/auth (`app/api/auth/**`, `lib/auth*`)

- Create account → `createUser(db, { email, phone, name })`.
- Look up on login/verify → `findUser(db, { email })` / `{ phone }` / `{ id }`.
- After a verification code checks out → `markVerified(db, userId, "email" | "phone")`.
- Lane B owns the verification-code storage and SMS/email sending; this layer
  only stores the user and verified flags. If Lane B wants codes persisted in
  D1, add a `verification_codes` table to `schema.sql` (coordinate with Lane D).

### Lane C — admin/skipper inbox (`app/admin/**`)

- `listThreads(db)` → one row per reservation code, most-recent first.
- `listMessages(db, code)` → open a thread; reply with `addMessage(..., { sender: "captain" })`.

### Existing /api/track

No change needed. `schema.sql` now documents the `events` table it writes to
so a fresh DB can be bootstrapped from this one file. The `INSERT` in
`route.js` is positional — do not reorder the `events` columns.

## Open questions / decisions for Lanes A/B/C/F

1. **ID generation** — helpers use `crypto.randomUUID()` (available on Workers).
   Fine for everyone?
2. **No bookings table** — chat threads can be opened for any code, even one
   with no real booking. Acceptable, or should we validate the code against
   `events` first?
3. **`read_at`** — column exists for read receipts but no helper sets it yet.
   Add `markRead(db, code, sender)` if/when the UI needs unread badges.
4. **Verification codes** — store in D1 (new table) or in KV / short-lived
   memory? Lane B to decide; schema can grow to match.
5. **Captain vs admin** — both are the same person (Kristian). Kept as two
   `sender` values in case the roles diverge; collapse to one if not needed.

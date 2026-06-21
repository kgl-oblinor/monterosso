# Lane A · Chat (customer ↔ captain) — PLAN

A calm, one-thread chat between a guest and their skipper, tied to a
reservation code. Kristian = admin (captain side lives in Lane C).

## What's built (scaffold)

| File | Role |
|---|---|
| `components/chat/MessageBubble.js` | One message; customer = right, captain = left |
| `components/chat/MessageList.js` | Scrollable thread + empty state |
| `components/chat/Composer.js` | Send box (Enter sends, Shift+Enter = newline) |
| `components/chat/chat.css` | Scoped styles (cream #f7f1e3, Fraunces, Great Vibes, radius 0, 4px scale) |
| `app/chat/[code]/page.js` | Thread view for one reservation code |
| `app/api/messages/route.js` | GET (list by code) + POST (add) — **in-memory stub** |

## Design system (from MÅL.md fasit)
- Solid cream surface `#f7f1e3` (chat-specific; differs from globals `--cream`).
- Fonts already loaded globally in `app/layout.js`: Fraunces, Great Vibes, Limelight.
- Sharp corners (radius 0), 4px spacing scale, calm forward verbs ("Send").
- Styles are scoped under `.krin-chat` so they never touch `landing.css` / `globals.css`.

## Data shape
A message: `{ id, sender: "customer" | "captain", text, ts }`, grouped by `code`.

## Integration TODOs (hand-offs)
- **Lane D (DB):** replace the in-memory `Map` in `app/api/messages/route.js`
  with D1-backed helpers from `lib/db.js` (`listMessages(code)`,
  `addMessage({code, sender, text, ts})`) against the `messages` table
  (code, sender, text, ts). D1 binding: `getCloudflareContext().env.DB`
  (pattern in `app/admin/page.js`). **Do not edit `lib/db.js` from Lane A.**
- **Lane C (admin/skipper):** captain replies POST with `sender: "captain"`;
  admin inbox lists threads grouped by `code`.
- **Lane B (onboarding/auth):** gate the thread so only the verified guest on
  that reservation (and the captain) can read/post. Currently open by code.

## Open questions
1. **Reservation code source** — does it equal the Stripe/booking `code` already
   used in the `events` table (admin)? Need the canonical code format from Lane D.
2. **Live updates** — polling vs. push? Scaffold loads once on mount + after send.
   A short poll or SSE can come later if the skipper needs near-real-time.
3. **Who is "mine"** — the thread page assumes the viewer is the customer.
   The captain view (Lane C) will need the inverse mapping; MessageBubble already
   keys off `sender`, so it's reusable.

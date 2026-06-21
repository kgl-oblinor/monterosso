# Lane B — Onboarding / light account + verification — PLAN

Calm, password-free signup: a guest leaves an optional **email** and/or
**SMS/WhatsApp number**, we send a short 6-digit code, they type it back, and
they're in — straight to the chat with the skipper.

## Files (this lane)
- `app/(auth)/join/page.js` — enter email + phone, pick SMS/WhatsApp → request code.
- `app/(auth)/verify/page.js` — enter the 6-digit code → verified → `/chat`.
- `app/(auth)/auth.css` — scoped surface styling (solid cream, Fraunces, Limelight gold CTA, sharp corners).
- `app/api/auth/route.js` — `request-code` + `verify-code` actions (STUB).
- `lib/auth.js` — code make/verify + contact validation helpers.

## Status: working stub
- The full flow runs locally: codes are minted, logged to the server console,
  and (in dev only) returned as `devCode` so verify is testable without a
  provider. Codes live in an **in-memory Map** in the route — fine for dev,
  not production.

## OPEN DECISIONS (need a call before launch)

### 1. SMS / WhatsApp provider — `TODO(provider)`
Recommendation: **Twilio**.
- SMS via Twilio Programmable Messaging, WhatsApp via Twilio's WhatsApp sender
  (or the Meta WhatsApp Cloud API directly if we want to skip Twilio's margin).
- Twilio also offers **Verify** (managed OTP: send + check, rate limiting,
  fraud signals) — worth considering instead of rolling our own codes, since it
  removes the storage + expiry burden entirely.
- Needs: account SID, auth token, a sender number / WhatsApp business sender.
  Store as env vars (mirror `.env.local.example`), read via `process.env` /
  Cloudflare Worker bindings.
- Decision needed from Kristian: Twilio (fastest) vs Meta WhatsApp Cloud API
  (cheaper at scale, more setup). Default to Twilio unless told otherwise.

### 2. Email channel — `TODO(provider)`
Recommendation: a transactional sender — **Resend** (simple, Workers-friendly)
or Postmark / SES. One verified sending domain + API key.

### 3. Persistence — `TODO(persist)` (depends on Lane D)
Move the in-memory code store and the lightweight user record to **Lane D's
`lib/db.js`** (D1). Do not edit it from this lane — coordinate.
- `users`: email, phone, verified flag (per COORDINATION.md Lane D schema).
- verification codes: store hashed `code` + `expiresAt`, keyed by contact;
  one-time use; rate-limit requests per contact. (Or let Twilio Verify own this.)
- On verify success: mark user verified + issue a session (cookie/token) so the
  guest lands authenticated in the chat.

### 4. Tie to the booking code
Onboarding should link the new user to their reservation code so the chat
thread (Lane A) and admin inbox (Lane C) line up. Confirm whether the booking
code is collected here or already known from the booking flow.

## Notes
- No password anywhere — by design (elderly-mobile-friendly, ~3 taps).
- Channel auto-pick in the API: phone present → SMS/WhatsApp, else email.
- `/chat` (handoff target) is owned by Lane A; not built here.

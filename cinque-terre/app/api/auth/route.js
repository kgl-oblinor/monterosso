// ============================================================
// Lane B — Onboarding / light account + verification (API)
//
// One POST endpoint, two actions chosen by `body.action`:
//   - "request-code": create/find a lightweight user from an optional email
//      + SMS/WhatsApp number, mint a code, and (eventually) send it.
//   - "verify-code":  check the code the guest typed back.
//
// Right now this is a working STUB:
//   * No real SMS/email is sent yet — see TODO(provider) below and
//     app/(auth)/PLAN.md for the channel decision (Twilio / WhatsApp / email).
//   * Codes are kept in an in-memory Map so the flow is testable end-to-end
//     in local dev. This does NOT survive a restart and is NOT multi-instance
//     safe — it must move to the DB before production (see TODO(persist)).
//
// Persistence (users + verification codes) belongs to Lane D in
// `cinque-terre/lib/db.js` (D1). We only reference it here in comments and
// never edit it. The existing app/api/track/route.js shows the D1 pattern:
//   const { env } = getCloudflareContext(); const db = env?.DB; ...
// ============================================================

import {
  isValidEmail,
  normalizePhone,
  makeChallenge,
  verifyCode,
} from "../../../lib/auth.js";

// TODO(persist): replace this in-memory store with Lane D's lib/db.js
// (D1 tables: users, verification_codes). Key by the contact we sent to.
const challenges = new Map(); // key (email|phone) -> { code, expiresAt }

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");

  if (action === "request-code") return requestCode(body);
  if (action === "verify-code") return verifyCodeAction(body);

  return Response.json({ ok: false, error: "Unknown action." }, { status: 400 });
}

async function requestCode(body) {
  const email = body.email ? String(body.email).trim() : "";
  const phone = body.phone ? String(body.phone).trim() : "";

  // At least one channel is required; both are optional individually.
  const emailOk = email ? isValidEmail(email) : false;
  const normPhone = phone ? normalizePhone(phone) : null;

  if (email && !emailOk) {
    return Response.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 400 }
    );
  }
  if (phone && !normPhone) {
    return Response.json(
      { ok: false, error: "That number doesn't look right." },
      { status: 400 }
    );
  }
  if (!emailOk && !normPhone) {
    return Response.json(
      { ok: false, error: "Add an email or a phone number." },
      { status: 400 }
    );
  }

  // Prefer SMS/WhatsApp if a number is given (the elderly-mobile happy path),
  // else fall back to email.
  const channel = normPhone ? (body.whatsapp ? "whatsapp" : "sms") : "email";
  const to = normPhone || email;

  const challenge = makeChallenge();
  challenges.set(to, challenge);

  // TODO(persist): upsert the lightweight user (email, phone, verified=false)
  // and store the challenge via Lane D's lib/db.js instead of the Map above.

  // TODO(provider): actually send `challenge.code` to `to` over `channel`.
  //   - SMS/WhatsApp: Twilio (recommended) or WhatsApp Cloud API.
  //   - email: a transactional sender (Resend / Postmark / SES).
  // For now we just log it so the verify step is testable in dev.
  console.log(`[auth] code for ${to} via ${channel}: ${challenge.code}`);

  return Response.json({
    ok: true,
    channel,
    // `to` is echoed so the verify screen can say where the code went.
    // `devCode` only in dev so the flow can be walked without a provider.
    to,
    devCode: process.env.NODE_ENV === "production" ? undefined : challenge.code,
  });
}

async function verifyCodeAction(body) {
  const to = body.to ? String(body.to).trim() : "";
  const code = body.code ? String(body.code).trim() : "";

  if (!to) {
    return Response.json(
      { ok: false, error: "Missing contact." },
      { status: 400 }
    );
  }

  const challenge = challenges.get(to);
  const result = verifyCode(challenge, code);

  if (!result.ok) {
    const msg =
      result.reason === "expired"
        ? "That code has expired — ask for a new one."
        : "That code didn't match. Try again.";
    return Response.json({ ok: false, error: msg }, { status: 400 });
  }

  // One-time use.
  challenges.delete(to);

  // TODO(persist): mark the user verified in Lane D's lib/db.js and issue a
  // session (cookie / token) so they land in the chat with the skipper.

  return Response.json({ ok: true });
}

// ============================================================
// Lane B — Onboarding / light account + verification
// Helpers for the lightweight signup + verify flow.
//
// No passwords. A guest gives an optional email and/or an SMS/WhatsApp
// number; we send a short numeric code to one of those channels and they
// type it back. That's the whole account.
//
// These helpers are channel-agnostic and storage-agnostic on purpose:
//   - the API route (app/api/auth/route.js) owns transport + persistence
//   - the real SMS/email provider is a TODO (see app/(auth)/PLAN.md)
//   - the users/codes tables live in Lane D (lib/db.js) — not edited here
// ============================================================

// How long a code stays valid, and how many digits it has.
export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const CODE_LENGTH = 6;

// --- contact validation -------------------------------------------------

// Loose, forgiving email check — enough to catch typos, not to reject odd
// but valid addresses. Onboarding should never feel like a gatekeeper.
export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const v = email.trim();
  return v.length >= 3 && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Normalise a phone number to a bare "+<digits>" form (E.164-ish). We keep a
// leading + and strip spaces, dashes and parentheses. We do NOT guess a
// country code — the join form asks for the full international number.
export function normalizePhone(phone) {
  if (typeof phone !== "string") return null;
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null; // E.164 bounds
  return (hasPlus ? "+" : "+") + digits;
}

// --- code lifecycle -----------------------------------------------------

// A 6-digit code, zero-padded. Uses crypto when available (Workers/modern
// runtimes expose globalThis.crypto), falling back to Math.random locally.
export function makeCode() {
  const max = 10 ** CODE_LENGTH; // 1_000_000 for 6 digits
  let n;
  if (globalThis.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    n = buf[0] % max;
  } else {
    n = Math.floor(Math.random() * max);
  }
  return String(n).padStart(CODE_LENGTH, "0");
}

// Compare a submitted code against a stored challenge.
// `challenge` = { code, expiresAt } (expiresAt is an epoch-ms number).
// Returns { ok: true } or { ok: false, reason }.
export function verifyCode(challenge, submitted) {
  if (!challenge || typeof challenge.code !== "string") {
    return { ok: false, reason: "no_code" };
  }
  if (typeof challenge.expiresAt === "number" && Date.now() > challenge.expiresAt) {
    return { ok: false, reason: "expired" };
  }
  const clean = String(submitted || "").replace(/\D/g, "");
  if (clean.length !== CODE_LENGTH) return { ok: false, reason: "format" };
  if (!timingSafeEqual(clean, challenge.code)) {
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true };
}

// Build a fresh challenge for storage.
export function makeChallenge() {
  return { code: makeCode(), expiresAt: Date.now() + CODE_TTL_MS };
}

// Constant-time-ish string compare so a wrong code can't be guessed by
// timing. Both inputs are short numeric strings of equal expected length.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

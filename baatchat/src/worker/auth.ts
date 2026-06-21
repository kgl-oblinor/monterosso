// Authentication.
//
// Returning users: email + password (POST /auth/login).
// First-time onboarding ("claim your account"): a customer or skipper proves they own the
// on-file email via a 6-digit code, then sets a password. A customer can also onboard via a
// RESERVATION CODE — the code is sent to the email on file for that reservation's customer.
// Admins (Kristian): a separate password login (allow-listed emails + shared secret).

import { sign, verify } from "hono/jwt";
import type { Env } from "./index";
import { sendOtpEmail } from "./email";

const CODE_TTL = 600; // seconds (10 min)
const RESEND_COOLDOWN = 60; // seconds between code requests per email
const MAX_ATTEMPTS = 5; // wrong code attempts before the code is invalidated
const TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days
const MIN_PASSWORD = 8;
const LOGIN_FAIL_MAX = 10; // failed password logins per email before lockout
const LOGIN_FAIL_TTL = 600;
const ADMIN_FAIL_MAX = 10;
const ADMIN_FAIL_TTL = 600;

// PBKDF2 work factor. NOTE: higher = safer but more CPU. The Workers FREE plan caps at
// 10ms CPU/request, which this may exceed — if login errors on free, lower this or use
// Workers Paid (30s CPU). Tuneable in one place.
const PBKDF2_ITERATIONS = 100_000;

export interface SessionUser {
  id: number;
  role: "skipper" | "customer" | "admin";
  name: string | null;
  email: string;
}

export interface RegisterId {
  email?: string;
  reservationCode?: string;
}

const normEmail = (e: string) => e.trim().toLowerCase();

function sixDigitCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function mask(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain ?? ""}`;
}

// --- password hashing (PBKDF2-HMAC-SHA256, salted) --------------------------

function b64encode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function b64decode(str: string): Uint8Array {
  const bin = atob(str);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

async function deriveHash(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256
  );
  return b64encode(new Uint8Array(bits));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveHash(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64encode(salt)}$${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  const computed = await deriveHash(password, b64decode(saltB64), parseInt(iterStr, 10));
  return constantTimeEqual(computed, hashB64);
}

// --- identity resolution + OTP ---------------------------------------------

// Resolve an onboarding identifier to the on-file account + its email (so we can send the
// proof code). A reservation code resolves to that reservation's customer.
async function resolveForRegistration(
  env: Env,
  id: RegisterId
): Promise<{ partyId: number; role: "skipper" | "customer"; email: string; name: string | null } | null> {
  if (id.reservationCode) {
    const code = id.reservationCode.trim().toUpperCase();
    const r = await env.DB.prepare(
      `SELECT c.customer_id AS partyId, c.email, c.name
         FROM reservations rv
         JOIN customers c ON rv.customer_id = c.customer_id
        WHERE rv.reservation_code = ? LIMIT 1`
    )
      .bind(code)
      .first<{ partyId: number; email: string | null; name: string | null }>();
    if (r?.email) return { partyId: r.partyId, role: "customer", email: normEmail(r.email), name: r.name };
    return null;
  }
  if (id.email) {
    const e = normEmail(id.email);
    const cust = await env.DB.prepare(
      `SELECT customer_id AS partyId, name FROM customers WHERE lower(email) = ? LIMIT 1`
    )
      .bind(e)
      .first<{ partyId: number; name: string | null }>();
    if (cust) return { partyId: cust.partyId, role: "customer", email: e, name: cust.name };
    const skipper = await env.DB.prepare(
      `SELECT skipper_id AS partyId, COALESCE(name, boat_name) AS name
         FROM skippers WHERE lower(email) = ? LIMIT 1`
    )
      .bind(e)
      .first<{ partyId: number; name: string | null }>();
    if (skipper) return { partyId: skipper.partyId, role: "skipper", email: e, name: skipper.name };
    return null;
  }
  return null;
}

async function checkAndConsumeOtp(env: Env, email: string, code: string): Promise<boolean> {
  const key = `otp:${email}`;
  const raw = await env.OTP.get(key);
  if (!raw) return false;
  const rec = JSON.parse(raw) as { code: string; attempts: number };
  if (rec.code !== String(code).trim()) {
    const attempts = rec.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) await env.OTP.delete(key);
    else await env.OTP.put(key, JSON.stringify({ ...rec, attempts }), { expirationTtl: CODE_TTL });
    return false;
  }
  await env.OTP.delete(key);
  return true;
}

async function issueToken(env: Env, user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    { sub: user.id, role: user.role, name: user.name, email: user.email, exp: now + TOKEN_TTL },
    env.CHAT_JWT_SECRET!
  );
}

// --- account claim (onboarding) --------------------------------------------

// Send the verification code to the account's ON-FILE email. Returns the masked address
// it went to, or null if no matching account (caller shows a generic message either way).
export async function registerStart(env: Env, id: RegisterId): Promise<{ sentTo: string | null }> {
  const acct = await resolveForRegistration(env, id);
  if (!acct) return { sentTo: null };

  const onCooldown = await env.OTP.get(`cd:${acct.email}`);
  if (!onCooldown) {
    const code = sixDigitCode();
    await env.OTP.put(`otp:${acct.email}`, JSON.stringify({ code, attempts: 0 }), { expirationTtl: CODE_TTL });
    await env.OTP.put(`cd:${acct.email}`, "1", { expirationTtl: RESEND_COOLDOWN });
    if (env.SENDGRID_API_KEY) await sendOtpEmail(env, acct.email, code);
    else console.log(`[auth] DEV code for ${acct.email}: ${code} (onboarding; SENDGRID unset)`);
  }
  return { sentTo: mask(acct.email) };
}

// Verify the code and set the password — creates (or resets) the chat account, returns a JWT.
export async function registerComplete(
  env: Env,
  id: RegisterId,
  code: string,
  password: string
): Promise<{ ok: true; token: string; user: SessionUser } | { ok: false; error: string }> {
  if (!password || password.length < MIN_PASSWORD) {
    return { ok: false, error: `Passordet må ha minst ${MIN_PASSWORD} tegn` };
  }
  const acct = await resolveForRegistration(env, id);
  if (!acct) return { ok: false, error: "Fant ingen konto" };
  if (!(await checkAndConsumeOtp(env, acct.email, code))) {
    return { ok: false, error: "Ugyldig eller utløpt kode" };
  }

  const hash = await hashPassword(password);
  // New accounts start `pending` (awaiting admin approval) and email_verified (code
  // proven). On re-claim/reset, KEEP the existing status (don't lock out approved users).
  await env.DB.prepare(
    `INSERT INTO chat_accounts (party_id, email, role, display_name, password_hash, status, email_verified, last_login_at)
     VALUES (?, ?, ?, ?, ?, 'pending', 1, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET
       party_id = excluded.party_id, role = excluded.role,
       display_name = excluded.display_name, password_hash = excluded.password_hash,
       email_verified = 1, last_login_at = datetime('now')`
  )
    .bind(acct.partyId, acct.email, acct.role, acct.name, hash)
    .run();

  const user: SessionUser = { id: acct.partyId, role: acct.role, name: acct.name, email: acct.email };
  return { ok: true, token: await issueToken(env, user), user };
}

// --- password login ---------------------------------------------------------

export type LoginResult =
  | { ok: true; token: string; user: SessionUser; status: string; emailVerified: boolean }
  | { ok: false; reason: "invalid" | "locked" };

export async function passwordLogin(env: Env, rawEmail: string, password: string): Promise<LoginResult> {
  const email = normEmail(rawEmail);
  const failKey = `login_fail:${email}`;
  const fails = Number(await env.OTP.get(failKey)) || 0;
  if (fails >= LOGIN_FAIL_MAX) return { ok: false, reason: "locked" };

  const row = await env.DB.prepare(
    `SELECT party_id AS id, role, display_name AS name, email, password_hash,
            status, email_verified AS ev
       FROM chat_accounts WHERE email = ? LIMIT 1`
  )
    .bind(email)
    .first<{
      id: number; role: SessionUser["role"]; name: string | null; email: string;
      password_hash: string | null; status: string; ev: number;
    }>();

  const valid = !!row?.password_hash && (await verifyPassword(password, row.password_hash));
  if (!valid) {
    await env.OTP.put(failKey, String(fails + 1), { expirationTtl: LOGIN_FAIL_TTL });
    return { ok: false, reason: "invalid" };
  }

  await env.OTP.delete(failKey);
  await env.DB.prepare(`UPDATE chat_accounts SET last_login_at = datetime('now') WHERE email = ?`)
    .bind(email)
    .run();
  const user: SessionUser = { id: row!.id, role: row!.role, name: row!.name, email: row!.email };
  return { ok: true, token: await issueToken(env, user), user, status: row!.status, emailVerified: !!row!.ev };
}

// Current approval state for an account — used by the chat gate and /auth/me.
export async function getAccountState(
  env: Env,
  email: string
): Promise<{ status: string; emailVerified: boolean } | null> {
  const r = await env.DB.prepare(
    `SELECT status, email_verified AS ev FROM chat_accounts WHERE email = ? LIMIT 1`
  )
    .bind(normEmail(email))
    .first<{ status: string; ev: number }>();
  return r ? { status: r.status, emailVerified: !!r.ev } : null;
}

// --- admin login (password, allow-listed staff emails) ---------------------

export type AdminLoginResult =
  | { ok: true; token: string; user: SessionUser }
  | { ok: false; reason: "invalid" | "locked" };

export async function adminLogin(env: Env, rawEmail: string, password: string): Promise<AdminLoginResult> {
  const email = normEmail(rawEmail);
  const admins = (env.ADMIN_EMAILS ?? "").split(",").map((s) => normEmail(s)).filter(Boolean);

  const failKey = `admin_fail:${email}`;
  const fails = Number(await env.OTP.get(failKey)) || 0;
  if (fails >= ADMIN_FAIL_MAX) return { ok: false, reason: "locked" };

  const ok =
    admins.includes(email) && !!env.ADMIN_PASSWORD && constantTimeEqual(password, env.ADMIN_PASSWORD);
  if (!ok) {
    await env.OTP.put(failKey, String(fails + 1), { expirationTtl: ADMIN_FAIL_TTL });
    return { ok: false, reason: "invalid" };
  }

  await env.OTP.delete(failKey);
  const user: SessionUser = { id: 0, role: "admin", name: email, email };
  return { ok: true, token: await issueToken(env, user), user };
}

// --- admin recovery (forgot password → email code login) --------------------
// Admins share one ADMIN_PASSWORD secret, so there's no per-admin password to "reset".
// Instead, an admin who forgot it proves control of their allow-listed email via a 6-digit
// code and is logged straight in. The code is ONLY ever sent to an address in ADMIN_EMAILS.

function isAdminEmail(env: Env, email: string): boolean {
  const admins = (env.ADMIN_EMAILS ?? "").split(",").map((s) => normEmail(s)).filter(Boolean);
  return admins.includes(email);
}

async function checkAndConsumeAdminOtp(env: Env, email: string, code: string): Promise<boolean> {
  const key = `admin_otp:${email}`;
  const raw = await env.OTP.get(key);
  if (!raw) return false;
  const rec = JSON.parse(raw) as { code: string; attempts: number };
  if (rec.code !== String(code).trim()) {
    const attempts = rec.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) await env.OTP.delete(key);
    else await env.OTP.put(key, JSON.stringify({ ...rec, attempts }), { expirationTtl: CODE_TTL });
    return false;
  }
  await env.OTP.delete(key);
  return true;
}

// Send a recovery code to the admin's allow-listed email. Returns the masked address it
// went to, or null when the email isn't an admin (caller shows a generic message either way).
export async function adminRecoveryStart(env: Env, rawEmail: string): Promise<{ sentTo: string | null }> {
  const email = normEmail(rawEmail);
  if (!isAdminEmail(env, email)) return { sentTo: null };

  const onCooldown = await env.OTP.get(`admin_cd:${email}`);
  if (!onCooldown) {
    const code = sixDigitCode();
    await env.OTP.put(`admin_otp:${email}`, JSON.stringify({ code, attempts: 0 }), { expirationTtl: CODE_TTL });
    await env.OTP.put(`admin_cd:${email}`, "1", { expirationTtl: RESEND_COOLDOWN });
    if (env.SENDGRID_API_KEY) await sendOtpEmail(env, email, code);
    else console.log(`[auth] DEV admin recovery code for ${email}: ${code} (SENDGRID unset)`);
  }
  return { sentTo: mask(email) };
}

// Verify the recovery code and log the admin in. Shares the admin login lockout counter.
export async function adminRecoveryVerify(env: Env, rawEmail: string, code: string): Promise<AdminLoginResult> {
  const email = normEmail(rawEmail);
  const failKey = `admin_fail:${email}`;
  const fails = Number(await env.OTP.get(failKey)) || 0;
  if (fails >= ADMIN_FAIL_MAX) return { ok: false, reason: "locked" };

  if (!isAdminEmail(env, email) || !(await checkAndConsumeAdminOtp(env, email, code))) {
    await env.OTP.put(failKey, String(fails + 1), { expirationTtl: ADMIN_FAIL_TTL });
    return { ok: false, reason: "invalid" };
  }

  await env.OTP.delete(failKey);
  const user: SessionUser = { id: 0, role: "admin", name: email, email };
  return { ok: true, token: await issueToken(env, user), user };
}

// --- token validation -------------------------------------------------------

export async function userFromToken(env: Env, authHeader?: string): Promise<SessionUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const p = (await verify(authHeader.slice(7), env.CHAT_JWT_SECRET!, "HS256")) as any;
    return { id: p.sub, role: p.role, name: p.name ?? null, email: p.email };
  } catch {
    return null;
  }
}

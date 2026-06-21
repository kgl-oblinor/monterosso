import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerStart, registerComplete, passwordLogin, userFromToken, adminLogin, adminRecoveryStart, adminRecoveryVerify, getAccountState } from "./auth";
import type { SessionUser } from "./auth";
import { listContacts, listThreads, openThread, getMessages, postMessage, markRead, contactReservations } from "./chat";
import { listAccounts, approveAccount, revokeAccount, setEmailVerified, setSkipperEmail, setCustomerEmail, listSkipperDirectory, listCustomerDirectory, listAllThreads, adminThreadMessages } from "./admin";

export interface Env {
  DB: D1Database;
  OTP: KVNamespace;
  ALLOWED_ORIGINS: string;
  // Branding/config (vars). No secrets here.
  PLATFORM_NAME: string; // e.g. "Monterosso"
  EMAIL_FROM: string; // verified SendGrid sender address
  SUPPORT_EMAIL: string;
  // Admin login. Allowed staff emails (var, comma-separated); password a secret.
  ADMIN_EMAILS: string;
  ADMIN_PASSWORD?: string;
  // Stamped at deploy time by CI (--var). Defaults in wrangler.toml for local dev.
  APP_VERSION: string; // monotonic build number, e.g. "42"
  GIT_SHA: string; // commit the live code was built from
  // secrets (set via `wrangler secret put`):
  ADMIN_SYNC_KEY?: string; // shared secret guarding /admin/* trigger endpoints
  CHAT_JWT_SECRET?: string;
  SENDGRID_API_KEY?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", (c, next) => {
  const allowed = c.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  const originFn = (origin: string): string | null => {
    if (allowed.includes(origin)) return origin;
    // Accept any Cloudflare Pages deployment of this project (canonical + preview hashes).
    if (/^https:\/\/([a-z0-9-]+\.)?monterosso-chat-web\.pages\.dev$/.test(origin)) return origin;
    return null;
  };
  return cors({ origin: originFn, credentials: true })(c, next);
});

// Health check — proves code → Worker → D1 is wired end to end.
app.get("/health", async (c) => {
  let db = "unknown";
  try {
    const row = await c.env.DB.prepare(
      "SELECT count(*) AS n FROM sqlite_master WHERE type='table'"
    ).first<{ n: number }>();
    db = `ok (${row?.n ?? 0} tables)`;
  } catch (err) {
    db = `error: ${(err as Error).message}`;
  }
  return c.json({
    ok: true,
    service: "monterosso-chat",
    db,
    version: c.env.APP_VERSION,
    commit: c.env.GIT_SHA,
  });
});

// Which build is live right now — used to confirm a deploy/rollback landed.
app.get("/version", (c) =>
  c.json({ version: c.env.APP_VERSION, commit: c.env.GIT_SHA })
);

// --- auth: account claim (onboarding) + password login ---------------------
const auth = new Hono<{ Bindings: Env }>();

// Claim step 1: send a verification code to the on-file email of a customer/skipper
// (by email) or a customer (by reservation code). Generic response — `sentTo` is masked or null.
auth.post("/register/start", async (c) => {
  const { email, reservationCode } = await c.req
    .json<{ email?: string; reservationCode?: string }>()
    .catch(() => ({ email: undefined, reservationCode: undefined }));
  if (!email && !reservationCode) return c.json({ ok: false, error: "E-post eller reservasjonskode er påkrevd" }, 400);
  const { sentTo } = await registerStart(c.env, { email, reservationCode });
  return c.json({ ok: true, sentTo });
});

// Claim step 2: verify the code + set a password → creates the account, returns a JWT.
auth.post("/register/complete", async (c) => {
  const { email, reservationCode, code, password } = await c.req
    .json<{ email?: string; reservationCode?: string; code?: string; password?: string }>()
    .catch(() => ({ email: undefined, reservationCode: undefined, code: undefined, password: undefined }));
  if ((!email && !reservationCode) || !code || !password) {
    return c.json({ ok: false, error: "Identifikator, kode og passord er påkrevd" }, 400);
  }
  const r = await registerComplete(c.env, { email, reservationCode }, code, password);
  if (!r.ok) return c.json(r, 400);
  return c.json({ ok: true, token: r.token, user: r.user });
});

// Returning login: email + password.
auth.post("/login", async (c) => {
  const { email, password } = await c.req
    .json<{ email?: string; password?: string }>()
    .catch(() => ({ email: undefined, password: undefined }));
  if (!email || !password) return c.json({ ok: false, error: "E-post og passord er påkrevd" }, 400);
  const r = await passwordLogin(c.env, email, password);
  if (!r.ok && r.reason === "locked") return c.json({ ok: false, error: "For mange forsøk — prøv igjen senere" }, 429);
  if (!r.ok) return c.json({ ok: false, error: "Feil e-post eller passord" }, 401);
  return c.json({ ok: true, token: r.token, user: r.user, status: r.status, emailVerified: r.emailVerified });
});

// Admin login — password-based for platform staff (Kristian).
auth.post("/admin-login", async (c) => {
  const { email, password } = await c.req
    .json<{ email?: string; password?: string }>()
    .catch(() => ({ email: undefined, password: undefined }));
  if (!email || !password) return c.json({ ok: false, error: "E-post og passord er påkrevd" }, 400);
  const r = await adminLogin(c.env, email, password);
  if (!r.ok && r.reason === "locked")
    return c.json({ ok: false, error: "For mange forsøk — prøv igjen senere" }, 429);
  if (!r.ok) return c.json({ ok: false, error: "Feil e-post eller passord" }, 401);
  return c.json({ ok: true, token: r.token, user: r.user });
});

// Admin recovery (forgot password): email a code to an allow-listed admin address.
auth.post("/admin-reset/start", async (c) => {
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  if (!email) return c.json({ ok: false, error: "E-post er påkrevd" }, 400);
  const { sentTo } = await adminRecoveryStart(c.env, email);
  return c.json({ ok: true, sentTo });
});

auth.post("/admin-reset/verify", async (c) => {
  const { email, code } = await c.req
    .json<{ email?: string; code?: string }>()
    .catch(() => ({ email: undefined, code: undefined }));
  if (!email || !code) return c.json({ ok: false, error: "E-post og kode er påkrevd" }, 400);
  const r = await adminRecoveryVerify(c.env, email, code);
  if (!r.ok && r.reason === "locked")
    return c.json({ ok: false, error: "For mange forsøk — prøv igjen senere" }, 429);
  if (!r.ok) return c.json({ ok: false, error: "Ugyldig eller utløpt kode" }, 401);
  return c.json({ ok: true, token: r.token, user: r.user });
});

// Who am I — lets the frontend validate a stored token on load and show approval state.
auth.get("/me", async (c) => {
  const user = await userFromToken(c.env, c.req.header("Authorization"));
  if (!user) return c.json({ ok: false, error: "Ikke autorisert" }, 401);
  const state = user.role === "admin" ? { status: "active", emailVerified: true } : await getAccountState(c.env, user.email);
  return c.json({ ok: true, user, status: state?.status ?? "pending", emailVerified: state?.emailVerified ?? false });
});

app.route("/auth", auth);

// --- chat: contacts, threads, messages -------------------------------------
// Requires a valid customer/skipper JWT. Admins use the moderation endpoints instead.
const chat = new Hono<{ Bindings: Env; Variables: { user: SessionUser } }>();
chat.use("*", async (c, next) => {
  const user = await userFromToken(c.env, c.req.header("Authorization"));
  if (!user) return c.json({ ok: false, error: "Ikke autorisert" }, 401);
  if (user.role !== "customer" && user.role !== "skipper") {
    return c.json({ ok: false, error: "Chat er kun for kunder og skippere" }, 403);
  }
  // Approval gate: only admin-approved (active) accounts can chat.
  const state = await getAccountState(c.env, user.email);
  if (state?.status !== "active") {
    return c.json({ ok: false, error: "Kontoen venter på godkjenning", status: state?.status ?? "pending" }, 403);
  }
  c.set("user", user);
  await next();
});

// Who I can chat with (derived from shared reservations).
chat.get("/contacts", async (c) => c.json({ ok: true, contacts: await listContacts(c.env, c.get("user")) }));

// My conversations.
chat.get("/threads", async (c) => c.json({ ok: true, threads: await listThreads(c.env, c.get("user")) }));

// Open (or fetch) a thread with a contact.
chat.post("/threads", async (c) => {
  const { contactId } = await c.req.json<{ contactId?: number }>().catch(() => ({ contactId: undefined }));
  if (!contactId) return c.json({ ok: false, error: "Kontakt-ID er påkrevd" }, 400);
  const thread = await openThread(c.env, c.get("user"), Number(contactId));
  if (!thread) return c.json({ ok: false, error: "Du kan ikke chatte med denne parten" }, 403);
  return c.json({ ok: true, thread });
});

// Poll messages in a thread (use ?since=<lastId> for deltas).
chat.get("/threads/:id/messages", async (c) => {
  const threadId = Number(c.req.param("id"));
  const since = Number(c.req.query("since")) || 0;
  const messages = await getMessages(c.env, c.get("user"), threadId, since);
  if (messages === null) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  return c.json({ ok: true, messages });
});

// Send a message.
chat.post("/threads/:id/messages", async (c) => {
  const threadId = Number(c.req.param("id"));
  const { body } = await c.req.json<{ body?: string }>().catch(() => ({ body: undefined }));
  if (!body) return c.json({ ok: false, error: "Melding er påkrevd" }, 400);
  // Cap message length at 500 words (mirrors the composer guard).
  if (body.trim().split(/\s+/).filter(Boolean).length > 500) {
    return c.json({ ok: false, error: "Meldingen kan ha maks 500 ord" }, 400);
  }
  const result = await postMessage(c.env, c.get("user"), threadId, body);
  if (result === null) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  if (result === "locked") return c.json({ ok: false, error: "Samtalen er låst" }, 409);
  return c.json({ ok: true, message: result });
});

// The reservation(s) a conversation concerns — context for both parties. Keyed by contact
// so it's available before any message is sent.
chat.get("/contacts/:id/reservations", async (c) => {
  const contactId = Number(c.req.param("id"));
  const reservations = await contactReservations(c.env, c.get("user"), contactId);
  return c.json({ ok: true, reservations });
});

// Mark a thread read up to a message id.
chat.post("/threads/:id/read", async (c) => {
  const threadId = Number(c.req.param("id"));
  const { lastMessageId } = await c.req.json<{ lastMessageId?: number }>().catch(() => ({ lastMessageId: undefined }));
  await markRead(c.env, c.get("user"), threadId, Number(lastMessageId) || 0);
  return c.json({ ok: true });
});

app.route("/chat", chat);

// --- admin (Kristian): directory + approval + conversation oversight --------
// Authorized by EITHER an admin JWT (from /auth/admin-login) OR the ADMIN_SYNC_KEY header.
const admin = new Hono<{ Bindings: Env }>();
admin.use("*", async (c, next) => {
  const authz = c.req.header("Authorization");
  const bySyncKey = !!c.env.ADMIN_SYNC_KEY && authz === c.env.ADMIN_SYNC_KEY;
  const user = await userFromToken(c.env, authz);
  if (!bySyncKey && user?.role !== "admin") {
    return c.json({ ok: false, error: "Ikke autorisert" }, 401);
  }
  await next();
});

// User management — list claimed accounts; approve/revoke chat access; verify email.
admin.get("/users", async (c) => c.json({ ok: true, users: await listAccounts(c.env) }));

// Full directory — every skipper/customer + whether they've onboarded yet.
admin.get("/directory/skippers", async (c) =>
  c.json({ ok: true, skippers: await listSkipperDirectory(c.env) })
);
admin.get("/directory/customers", async (c) => {
  const search = c.req.query("search") || undefined;
  const limit = Math.min(Number(c.req.query("limit")) || 50, 100);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);
  const { customers, total } = await listCustomerDirectory(c.env, { search, limit, offset });
  return c.json({ ok: true, customers, total, limit, offset });
});

// Conversation oversight (read-only): list every thread, and read any thread's messages.
admin.get("/threads", async (c) => {
  const search = c.req.query("search") || undefined;
  const limit = Math.min(Number(c.req.query("limit")) || 50, 100);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);
  const { threads, total } = await listAllThreads(c.env, { search, limit, offset });
  return c.json({ ok: true, threads, total, limit, offset });
});
admin.get("/threads/:id/messages", async (c) => {
  const data = await adminThreadMessages(c.env, Number(c.req.param("id")));
  if (!data) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  return c.json({ ok: true, ...data });
});

admin.post("/users/:id/approve", async (c) => {
  const ok = await approveAccount(c.env, Number(c.req.param("id")));
  return ok ? c.json({ ok: true }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

admin.post("/users/:id/revoke", async (c) => {
  const ok = await revokeAccount(c.env, Number(c.req.param("id")));
  return ok ? c.json({ ok: true }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

admin.post("/users/:id/verify-email", async (c) => {
  const { verified } = await c.req.json<{ verified?: boolean }>().catch(() => ({ verified: true }));
  const ok = await setEmailVerified(c.env, Number(c.req.param("id")), verified ?? true);
  return ok ? c.json({ ok: true }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

// Set/correct a skipper's on-file email (so the onboarding code can reach them).
admin.post("/skippers/:id/email", async (c) => {
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  const e = (email ?? "").trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return c.json({ ok: false, error: "Oppgi en gyldig e-postadresse" }, 400);
  }
  const ok = await setSkipperEmail(c.env, Number(c.req.param("id")), e);
  return ok ? c.json({ ok: true, email: e }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

// Set/correct a customer's on-file email.
admin.post("/customers/:id/email", async (c) => {
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  const e = (email ?? "").trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return c.json({ ok: false, error: "Oppgi en gyldig e-postadresse" }, 400);
  }
  const ok = await setCustomerEmail(c.env, Number(c.req.param("id")), e);
  return ok ? c.json({ ok: true, email: e }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

app.route("/admin", admin);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;

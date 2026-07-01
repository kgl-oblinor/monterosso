import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerStart, registerComplete, passwordLogin, passwordlessEntry, userFromToken, adminLogin, adminRecoveryStart, adminRecoveryVerify, getAccountState } from "./auth";
import type { SessionUser } from "./auth";
import { listContacts, listThreads, openThread, getMessages, postMessage, markRead, contactReservations, myReservations, getMyProfile, updateMyProfile } from "./chat";
import { createInvite, joinByInvite, invitepreview, invitableTrips, listTripConversations, openTripThread, getTripMessages, postTripMessage, markTripRead } from "./group";
import { listAccounts, approveAccount, revokeAccount, setEmailVerified, setSkipperEmail, setCustomerEmail, listSkipperDirectory, listCustomerDirectory, listAllThreads, adminThreadMessages, listSkippers, getSkipper, createSkipper, updateSkipper, validateSkipperInput, listCustomers, listReservations } from "./admin";
import type { SkipperInput } from "./admin";
import { createPublicBooking } from "./public";

export interface Env {
  DB: D1Database;
  OTP: KVNamespace;
  ALLOWED_ORIGINS: string;
  // Branding/config (vars). No secrets here.
  PLATFORM_NAME: string; // e.g. "Monterosso"
  EMAIL_FROM: string; // verified SendGrid sender address
  SUPPORT_EMAIL: string;
  // Public base URL of the frontend app (used to build shareable /join invite links).
  APP_BASE_URL: string; // e.g. "https://monterosso-app.kgl-56a.workers.dev"
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
    // Accept the deployed Worker-served frontend (canonical + preview hashes).
    if (/^https:\/\/([a-z0-9-]+\.)?monterosso-app\.kgl-56a\.workers\.dev$/.test(origin)) return origin;
    // Accept the landing (cinque-terre) Worker frontend that calls the public booking endpoint.
    if (/^https:\/\/([a-z0-9-]+\.)?monterosso-cinque-terre\.kgl-56a\.workers\.dev$/.test(origin)) return origin;
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

// --- public booking intake (landing "Check availability") ------------------
// Intentionally UNAUTHENTICATED (frictionless): one call creates an instant customer
// account + a 'requested' reservation for the pilot skipper. CORS is handled by the
// global middleware above (landing origin allow-listed).
app.post("/public/bookings", async (c) => {
  const input = await c.req
    .json<{ tour?: string; date?: string; time?: string; guests?: number | string; email?: string; name?: string }>()
    .catch(() => ({}));
  const r = await createPublicBooking(c.env, input);
  if (!r.ok) return c.json({ ok: false, error: r.error }, 400);
  return c.json({ ok: true, code: r.code, reservationId: r.reservationId }, 201);
});

// --- auth: account claim (onboarding) + password login ---------------------
const auth = new Hono<{ Bindings: Env }>();

// Claim step 1: send a verification code to the on-file email of a customer/skipper
// (by email) or a customer (by reservation code). Generic response — `sentTo` is masked or null.
auth.post("/register/start", async (c) => {
  const { email, phone, reservationCode } = await c.req
    .json<{ email?: string; phone?: string; reservationCode?: string }>()
    .catch(() => ({ email: undefined, phone: undefined, reservationCode: undefined }));
  if (!email && !phone && !reservationCode)
    return c.json({ ok: false, error: "E-post, telefon eller reservasjonskode er påkrevd" }, 400);
  const { sentTo } = await registerStart(c.env, { email, phone, reservationCode });
  return c.json({ ok: true, sentTo });
});

// Claim step 2: verify the code + set a password → creates the account, returns a JWT.
auth.post("/register/complete", async (c) => {
  const { email, phone, reservationCode, code, password } = await c.req
    .json<{ email?: string; phone?: string; reservationCode?: string; code?: string; password?: string }>()
    .catch(() => ({ email: undefined, phone: undefined, reservationCode: undefined, code: undefined, password: undefined }));
  if ((!email && !phone && !reservationCode) || !code || !password) {
    return c.json({ ok: false, error: "Identifikator, kode og passord er påkrevd" }, 400);
  }
  const r = await registerComplete(c.env, { email, phone, reservationCode }, code, password);
  if (!r.ok) return c.json(r, 400);
  return c.json({ ok: true, token: r.token, user: r.user });
});

// Passwordless entry (the main way in): one identifier — email OR phone — is enough.
// Finds or creates a light customer account and logs straight in. An account that already
// has a password (or an admin email) is NOT bypassed: we answer needsPassword so the
// caller can switch to the password login.
auth.post("/passwordless", async (c) => {
  const { email, phone } = await c.req
    .json<{ email?: string; phone?: string }>()
    .catch(() => ({ email: undefined, phone: undefined }));
  if (!email && !phone) return c.json({ ok: false, error: "E-post eller telefon er påkrevd" }, 400);
  const r = await passwordlessEntry(c.env, { email, phone });
  if (!r.ok && r.reason === "needs_password")
    return c.json({ ok: false, needsPassword: true, error: "Denne kontoen er sikret med passord — logg inn med passord" }, 409);
  if (!r.ok) return c.json({ ok: false, error: "Oppgi en gyldig e-post eller telefon" }, 400);
  return c.json({ ok: true, token: r.token, user: r.user, status: r.status });
});

// Invite preview (public): a read-only look at a /join link before the visitor identifies —
// which trip it's for, and whether it's already been used. Generic null if the token is bad.
auth.get("/join/preview", async (c) => {
  const tok = c.req.query("invite") || "";
  if (!tok) return c.json({ ok: false, error: "Mangler invitasjon" }, 400);
  const preview = await invitepreview(c.env, tok);
  if (!preview) return c.json({ ok: false, error: "Ugyldig invitasjon" }, 404);
  return c.json({ ok: true, invite: preview });
});

// Join via invite (public, passwordless): consume the token, link/create the visitor's
// customer account, add them to the reservation's group, and return a session JWT — exactly
// like /auth/passwordless, but it also joins the group ("turfølget"). One identifier is enough.
auth.post("/join", async (c) => {
  const { invite, email, phone } = await c.req
    .json<{ invite?: string; email?: string; phone?: string }>()
    .catch(() => ({ invite: undefined, email: undefined, phone: undefined }));
  if (!invite) return c.json({ ok: false, error: "Mangler invitasjon" }, 400);
  if (!email && !phone) return c.json({ ok: false, error: "E-post eller telefon er påkrevd" }, 400);
  const r = await joinByInvite(c.env, invite, { email, phone });
  if (!r.ok && r.reason === "needs_password")
    return c.json({ ok: false, needsPassword: true, error: "Denne kontoen er sikret med passord — logg inn med passord" }, 409);
  if (!r.ok && r.reason === "used")
    return c.json({ ok: false, error: "Denne invitasjonen er allerede brukt" }, 409);
  if (!r.ok && r.reason === "invalid_invite")
    return c.json({ ok: false, error: "Ugyldig invitasjon" }, 404);
  if (!r.ok) return c.json({ ok: false, error: "Oppgi en gyldig e-post eller telefon" }, 400);
  return c.json({ ok: true, token: r.token, user: r.user, status: r.status, reservationCode: r.reservationCode });
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

// My trips ("Turer"). Role decides the filter: a customer sees their own reservations (with
// skipper/boat name); a skipper sees the reservations on their listings (with customer name).
chat.get("/me/reservations", async (c) =>
  c.json({ ok: true, reservations: await myReservations(c.env, c.get("user")) })
);

// My profile — the logged-in user's own contact details (name, email, phone).
chat.get("/me/profile", async (c) =>
  c.json({ ok: true, profile: await getMyProfile(c.env, c.get("user")) })
);

// Update my profile (name/email/phone). Writes to the role's source table + the auth row.
chat.put("/me/profile", async (c) => {
  const body = await c.req
    .json<{ name?: string; email?: string; phone?: string }>()
    .catch(() => ({}));
  try {
    const result = await updateMyProfile(c.env, c.get("user"), body);
    if ("error" in result) return c.json({ ok: false, error: result.error }, 400);
    return c.json({ ok: true, profile: result });
  } catch (err) {
    // The chat_accounts.email UNIQUE constraint can trip if the new email is taken.
    if (String((err as Error).message).includes("UNIQUE")) {
      return c.json({ ok: false, error: "E-postadressen er allerede i bruk" }, 409);
    }
    throw err;
  }
});

// --- group chat ("turfølget") ----------------------------------------------
// Trips the user can invite their party into (one of their reservations).
chat.get("/invite/trips", async (c) =>
  c.json({ ok: true, trips: await invitableTrips(c.env, c.get("user")) })
);

// Create a single-use invite for one of the user's reservations → a shareable /join link.
// email/phone are optional (recorded for display only); NO auto-send — the caller shares the link.
chat.post("/invite", async (c) => {
  const { reservationCode, email, phone } = await c.req
    .json<{ reservationCode?: string; email?: string; phone?: string }>()
    .catch(() => ({ reservationCode: undefined, email: undefined, phone: undefined }));
  if (!reservationCode) return c.json({ ok: false, error: "Reservasjonskode er påkrevd" }, 400);
  const r = await createInvite(c.env, c.get("user"), reservationCode, { email, phone });
  if ("error" in r) return c.json({ ok: false, error: r.error }, 400);
  return c.json({ ok: true, invite: r });
});

// My group/trip conversations (the shared "turfølget" threads I belong to).
chat.get("/trip-threads", async (c) =>
  c.json({ ok: true, trips: await listTripConversations(c.env, c.get("user")) })
);

// Open (or lazily create) the group thread for a reservation I belong to.
chat.post("/trip-threads", async (c) => {
  const { reservationId } = await c.req
    .json<{ reservationId?: number }>()
    .catch(() => ({ reservationId: undefined }));
  if (!reservationId) return c.json({ ok: false, error: "Reservasjons-ID er påkrevd" }, 400);
  const thread = await openTripThread(c.env, c.get("user"), Number(reservationId));
  if (!thread) return c.json({ ok: false, error: "Du er ikke med på denne turen" }, 403);
  return c.json({ ok: true, thread });
});

// Poll group-thread messages (?since=<lastId> for deltas).
chat.get("/trip-threads/:id/messages", async (c) => {
  const tripThreadId = Number(c.req.param("id"));
  const since = Number(c.req.query("since")) || 0;
  const messages = await getTripMessages(c.env, c.get("user"), tripThreadId, since);
  if (messages === null) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  return c.json({ ok: true, messages });
});

// Send a group message.
chat.post("/trip-threads/:id/messages", async (c) => {
  const tripThreadId = Number(c.req.param("id"));
  const { body } = await c.req.json<{ body?: string }>().catch(() => ({ body: undefined }));
  if (!body) return c.json({ ok: false, error: "Melding er påkrevd" }, 400);
  if (body.trim().split(/\s+/).filter(Boolean).length > 500) {
    return c.json({ ok: false, error: "Meldingen kan ha maks 500 ord" }, 400);
  }
  const result = await postTripMessage(c.env, c.get("user"), tripThreadId, body);
  if (result === null) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  if (result === "locked") return c.json({ ok: false, error: "Samtalen er låst" }, 409);
  return c.json({ ok: true, message: result });
});

// Mark a group thread read up to a message id.
chat.post("/trip-threads/:id/read", async (c) => {
  const tripThreadId = Number(c.req.param("id"));
  const { lastMessageId } = await c.req
    .json<{ lastMessageId?: number }>()
    .catch(() => ({ lastMessageId: undefined }));
  await markTripRead(c.env, c.get("user"), tripThreadId, Number(lastMessageId) || 0);
  return c.json({ ok: true });
});

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

// --- skipper listing CRUD (Kristian adds/edits a listing, e.g. Andrea/Paolona) ---
// Shared contract: GET /admin/skippers -> { skippers }, POST -> { skipper },
// PUT /admin/skippers/:id -> { skipper }.
admin.get("/skippers", async (c) => c.json({ ok: true, skippers: await listSkippers(c.env) }));

admin.post("/skippers", async (c) => {
  const input = await c.req.json<SkipperInput>().catch(() => ({} as SkipperInput));
  const v = validateSkipperInput(input, true);
  if (!v.ok) return c.json({ ok: false, error: v.error }, 400);
  const skipper = await createSkipper(c.env, input);
  if (!skipper) return c.json({ ok: false, error: "Kunne ikke opprette skipper" }, 500);
  return c.json({ ok: true, skipper }, 201);
});

admin.put("/skippers/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!(await getSkipper(c.env, id))) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  const input = await c.req.json<SkipperInput>().catch(() => ({} as SkipperInput));
  const v = validateSkipperInput(input, false);
  if (!v.ok) return c.json({ ok: false, error: v.error }, 400);
  const skipper = await updateSkipper(c.env, id, input);
  if (!skipper) return c.json({ ok: false, error: "Ikke funnet" }, 404);
  return c.json({ ok: true, skipper });
});

// Customers + reservations (admin overview per the shared contract).
admin.get("/customers", async (c) => c.json({ ok: true, customers: await listCustomers(c.env) }));
admin.get("/reservations", async (c) => c.json({ ok: true, reservations: await listReservations(c.env) }));

app.route("/admin", admin);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;

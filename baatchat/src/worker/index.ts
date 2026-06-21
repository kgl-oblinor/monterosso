import { Hono } from "hono";
import { cors } from "hono/cors";
import { runSyncData, resolveAddresses, syncLoansPage, syncUsersPage } from "./sync";
import { registerStart, registerComplete, passwordLogin, userFromToken, adminLogin, adminRecoveryStart, adminRecoveryVerify, getAccountState } from "./auth";
import type { SessionUser } from "./auth";
import { listContacts, listThreads, openThread, getMessages, postMessage, markRead, contactLoans } from "./chat";
import { listAccounts, approveAccount, revokeAccount, setEmailVerified, setLoanerEmail, setInvestorEmail, listLoanerDirectory, listInvestorDirectory, listAllThreads, adminThreadMessages } from "./admin";
import { resolveRecipients, audienceCount, listRecipients, sendBroadcast, validateWordLimits, saveDraft, listDrafts, getDraft, deleteDraft } from "./broadcast";
import type { Audience } from "./broadcast";

export interface Env {
  DB: D1Database;
  OTP: KVNamespace;
  ALLOWED_ORIGINS: string;
  // Oblinor WordPress sync (Phase 1). Base + username are vars; password a secret.
  OBLINOR_WP_BASE: string;
  OBLINOR_ADMIN_USERNAME: string;
  // Login email (Phase 2). Verified SendGrid sender address (a var).
  SENDGRID_FROM: string;
  // Admin login (Phase 2/4). Allowed staff emails (var, comma-separated); password a secret.
  ADMIN_EMAILS: string;
  ADMIN_PASSWORD?: string;
  // Stamped at deploy time by CI (--var). Defaults in wrangler.toml for local dev.
  APP_VERSION: string; // monotonic build number, e.g. "42"
  GIT_SHA: string; // commit the live code was built from
  // secrets (set via `wrangler secret put`):
  OBLINOR_ADMIN_PASSWORD?: string; // WP admin password (for the sync token)
  ADMIN_SYNC_KEY?: string; // shared secret guarding /admin/* trigger endpoints
  CHAT_JWT_SECRET?: string;
  SENDGRID_API_KEY?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", (c, next) => {
  const allowed = c.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  // Accept the configured origins, plus any Cloudflare Pages deployment of this project
  // (canonical + per-deploy preview hashes: *.oblinorchat-web.pages.dev).
  const originFn = (origin: string): string | null => {
    if (allowed.includes(origin)) return origin;
    if (/^https:\/\/([a-z0-9-]+\.)?oblinorchat-web\.pages\.dev$/.test(origin)) return origin;
    return null;
  };
  return cors({ origin: originFn, credentials: true })(c, next);
});

// Phase 0 health check — proves code → Worker → D1 is wired end to end.
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
    service: "oblinor-borrower-chat",
    db,
    version: c.env.APP_VERSION,
    commit: c.env.GIT_SHA,
  });
});

// Which build is live right now — used to confirm a deploy/rollback landed.
app.get("/version", (c) =>
  c.json({ version: c.env.APP_VERSION, commit: c.env.GIT_SHA })
);

// --- auth: account claim (register) + password login (Phase 2) -------------
const auth = new Hono<{ Bindings: Env }>();

// Claim step 1: send a verification code to the on-file email of an existing investor
// (by email) or loaner (by org number). Generic response — `sentTo` is masked or null.
auth.post("/register/start", async (c) => {
  const { email, orgNumber } = await c.req
    .json<{ email?: string; orgNumber?: string }>()
    .catch(() => ({ email: undefined, orgNumber: undefined }));
  if (!email && !orgNumber) return c.json({ ok: false, error: "E-post eller organisasjonsnummer er påkrevd" }, 400);
  const { sentTo } = await registerStart(c.env, { email, orgNumber });
  return c.json({ ok: true, sentTo });
});

// Claim step 2: verify the code + set a password → creates the account, returns a JWT.
auth.post("/register/complete", async (c) => {
  const { email, orgNumber, code, password } = await c.req
    .json<{ email?: string; orgNumber?: string; code?: string; password?: string }>()
    .catch(() => ({ email: undefined, orgNumber: undefined, code: undefined, password: undefined }));
  if ((!email && !orgNumber) || !code || !password) {
    return c.json({ ok: false, error: "Identifikator, kode og passord er påkrevd" }, 400);
  }
  const r = await registerComplete(c.env, { email, orgNumber }, code, password);
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

// Admin login — password-based for Oblinor staff (separate from the OTP flow).
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

// Admin recovery (forgot password): email a code to an allow-listed admin address, then
// log them in once they prove they received it. The shared ADMIN_PASSWORD is unchanged.
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
  // Admins have no chat_account row; investors/loaners get their live approval status.
  const state = user.role === "admin" ? { status: "active", emailVerified: true } : await getAccountState(c.env, user.email);
  return c.json({ ok: true, user, status: state?.status ?? "pending", emailVerified: state?.emailVerified ?? false });
});

app.route("/auth", auth);

// --- chat: contacts, threads, messages (Phase 2) ---------------------------
// Requires a valid investor/loaner JWT. Admins use the moderation endpoints instead.
const chat = new Hono<{ Bindings: Env; Variables: { user: SessionUser } }>();
chat.use("*", async (c, next) => {
  const user = await userFromToken(c.env, c.req.header("Authorization"));
  if (!user) return c.json({ ok: false, error: "Ikke autorisert" }, 401);
  if (user.role !== "investor" && user.role !== "loaner") {
    return c.json({ ok: false, error: "Chat er kun for långivere og låntakere" }, 403);
  }
  // Approval gate: only admin-approved (active) accounts can chat.
  const state = await getAccountState(c.env, user.email);
  if (state?.status !== "active") {
    return c.json({ ok: false, error: "Kontoen venter på godkjenning", status: state?.status ?? "pending" }, 403);
  }
  c.set("user", user);
  await next();
});

// Who I can chat with (derived from shared orders).
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

// The loan(s) a conversation concerns (loan id + address + amount) — context for both
// parties. Keyed by contact so it's available before any message is sent.
chat.get("/contacts/:id/loans", async (c) => {
  const contactId = Number(c.req.param("id"));
  const loans = await contactLoans(c.env, c.get("user"), contactId);
  return c.json({ ok: true, loans });
});

// Mark a thread read up to a message id.
chat.post("/threads/:id/read", async (c) => {
  const threadId = Number(c.req.param("id"));
  const { lastMessageId } = await c.req.json<{ lastMessageId?: number }>().catch(() => ({ lastMessageId: undefined }));
  await markRead(c.env, c.get("user"), threadId, Number(lastMessageId) || 0);
  return c.json({ ok: true });
});

app.route("/chat", chat);

// --- admin (Phase 1 sync triggers + Phase 2 user management) ----------------
// Authorized by EITHER an admin JWT (from /auth/admin-login, used by the admin UI) OR
// the ADMIN_SYNC_KEY header (used by cron/manual sync triggers).
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

// Pull investors + loaners + loans + orders from Oblinor into D1 (no addresses).
admin.post("/sync", async (c) => {
  const counts = await runSyncData(c.env);
  return c.json({ ok: true, ...counts });
});

// Chunked user sync — load ALL users one page per call. Caller loops ?offset= until done.
admin.post("/sync-users", async (c) => {
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);
  const limit = Math.min(Number(c.req.query("limit")) || 100, 100);
  const r = await syncUsersPage(c.env, offset, limit);
  return c.json({ ok: true, ...r });
});

// Chunked loaner/loan sync — one small page per call (free-plan friendly). Reads
// loaner emails from D1 (no users re-pull). Caller loops with ?offset= until done.
admin.post("/sync-loans", async (c) => {
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);
  const limit = Math.min(Number(c.req.query("limit")) || 10, 25);
  const r = await syncLoansPage(c.env, offset, limit);
  return c.json({ ok: true, ...r });
});

// Resolve up to `limit` loan project addresses via Kartverket (bounded — repeat
// until `remaining` is 0). Default 30 keeps us well under the subrequest cap.
admin.post("/resolve-addresses", async (c) => {
  const limit = Math.min(Number(c.req.query("limit")) || 30, 45);
  const result = await resolveAddresses(c.env, limit);
  return c.json({ ok: true, ...result });
});

// User management — list claimed accounts; approve/revoke chat access; verify email.
admin.get("/users", async (c) => c.json({ ok: true, users: await listAccounts(c.env) }));

// Full directory — every synced loaner/investor + whether they've registered yet.
admin.get("/directory/loaners", async (c) =>
  c.json({ ok: true, loaners: await listLoanerDirectory(c.env) })
);
admin.get("/directory/investors", async (c) => {
  const search = c.req.query("search") || undefined;
  const limit = Math.min(Number(c.req.query("limit")) || 50, 100);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);
  const { investors, total } = await listInvestorDirectory(c.env, { search, limit, offset });
  return c.json({ ok: true, investors, total, limit, offset });
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

// Set/correct a loaner's on-file email (so borrowers without an email can register;
// the registration code goes to this address).
admin.post("/loaners/:id/email", async (c) => {
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  const e = (email ?? "").trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return c.json({ ok: false, error: "Oppgi en gyldig e-postadresse" }, 400);
  }
  const ok = await setLoanerEmail(c.env, Number(c.req.param("id")), e);
  return ok ? c.json({ ok: true, email: e }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

// Set/correct an investor's on-file email (same as loaners — for registration).
admin.post("/investors/:id/email", async (c) => {
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  const e = (email ?? "").trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return c.json({ ok: false, error: "Oppgi en gyldig e-postadresse" }, 400);
  }
  const ok = await setInvestorEmail(c.env, Number(c.req.param("id")), e);
  return ok ? c.json({ ok: true, email: e }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

// --- broadcast email (admin) ------------------------------------------------
// Compose-and-send to loaners (with a loan), investors (who invested), both, or a
// hand-picked set. Sending real mail is gated behind an explicit confirm flag; a
// single-address test send (testTo) bypasses the audience entirely.

// Count for a whole audience — UI shows "sends to N" before the admin composes.
admin.get("/email/audience-count", async (c) => {
  const audience = (c.req.query("audience") || "all") as Audience;
  if (!["loaners", "investors", "all"].includes(audience)) {
    return c.json({ ok: false, error: "Ugyldig mottakergruppe" }, 400);
  }
  return c.json({ ok: true, count: await audienceCount(c.env, audience) });
});

// Searchable/paginated recipient picker for the "specific recipients" mode.
admin.get("/email/recipients", async (c) => {
  const group = (c.req.query("group") || "loaners") as "loaners" | "investors";
  if (!["loaners", "investors"].includes(group)) {
    return c.json({ ok: false, error: "Ugyldig gruppe" }, 400);
  }
  const search = c.req.query("search") || undefined;
  const limit = Math.min(Number(c.req.query("limit")) || 50, 100);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);
  const { recipients, total } = await listRecipients(c.env, { group, search, limit, offset });
  return c.json({ ok: true, recipients, total, limit, offset });
});

interface SendBody {
  audience?: Audience;
  selected?: { loaners?: number[]; investors?: number[] };
  subject?: string;
  html?: string;
  testTo?: string;
  confirm?: boolean;
}

admin.post("/email/send", async (c) => {
  const body = await c.req.json<SendBody>().catch(() => ({} as SendBody));
  const subject = (body.subject ?? "").trim();
  const html = (body.html ?? "").trim();
  if (!subject) return c.json({ ok: false, error: "Emne er påkrevd" }, 400);
  if (!html) return c.json({ ok: false, error: "Innhold er påkrevd" }, 400);
  const limitError = validateWordLimits(subject, html);
  if (limitError) return c.json({ ok: false, error: limitError }, 400);

  // Test send: one address only, ignores audience. No confirm needed.
  if (body.testTo) {
    const r = await sendBroadcast(c.env, { subject, html, emails: [body.testTo.trim()] });
    return c.json({ ok: r.failed === 0, test: true, ...r });
  }

  const audience = (body.audience ?? "all") as Audience;
  if (!["loaners", "investors", "all", "selected"].includes(audience)) {
    return c.json({ ok: false, error: "Ugyldig mottakergruppe" }, 400);
  }
  const recipients = await resolveRecipients(c.env, audience, body.selected);
  if (recipients.length === 0) return c.json({ ok: false, error: "Ingen mottakere" }, 400);

  // Real broadcast — require an explicit confirm so it can't fire by accident.
  if (!body.confirm) {
    return c.json({ ok: false, needsConfirm: true, recipients: recipients.length });
  }

  const r = await sendBroadcast(c.env, {
    subject,
    html,
    emails: recipients.map((x) => x.email),
  });
  return c.json({ ok: r.failed === 0, ...r });
});

// --- email drafts (admin) — save/reload a composed broadcast --------------
admin.get("/email/drafts", async (c) => c.json({ ok: true, drafts: await listDrafts(c.env) }));

admin.get("/email/drafts/:id", async (c) => {
  const d = await getDraft(c.env, Number(c.req.param("id")));
  return d ? c.json({ ok: true, draft: d }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

admin.post("/email/drafts", async (c) => {
  const b = await c.req
    .json<{ id?: number; subject?: string; html?: string; audience?: string; selected?: unknown }>()
    .catch(() => ({}) as { id?: number; subject?: string; html?: string; audience?: string; selected?: unknown });
  if (!(b.subject ?? "").trim() && !(b.html ?? "").trim()) {
    return c.json({ ok: false, error: "Tomt utkast" }, 400);
  }
  const id = await saveDraft(c.env, {
    id: b.id,
    subject: b.subject ?? "",
    html: b.html ?? "",
    audience: b.audience ?? "loaners",
    selected: b.selected,
  });
  return c.json({ ok: true, id });
});

// Delete via POST (the frontend apiClient exposes get/post only).
admin.post("/email/drafts/:id/delete", async (c) => {
  const ok = await deleteDraft(c.env, Number(c.req.param("id")));
  return ok ? c.json({ ok: true }) : c.json({ ok: false, error: "Ikke funnet" }, 404);
});

app.route("/admin", admin);

export default {
  fetch: app.fetch,

  // Cron entrypoint — hourly pull-only sync from Oblinor, then a bounded address batch.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        await runSyncData(env);
        await resolveAddresses(env, 30);
      })()
    );
  },
} satisfies ExportedHandler<Env>;

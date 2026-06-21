// Lane C · Admin / captain inbox — index.
//
// Clean desktop inbox: every reservation code that has chat activity, with
// the customer's name/contact, last message and time. Click a row to open
// the thread at /admin/[code].
//
// WHY THIS PATH: app/admin/page.js already exists (the analytics
// dashboard, owned by an earlier build) and Lane C must not edit existing
// files — so the inbox lives at /admin/inbox. See PLAN.md "Open questions"
// for merging the two admin landing pages.
//
// DATA: reads Lane D's `messages` table directly via the Cloudflare D1
// binding (same server-component pattern the existing admin page uses).
// This keeps the inbox working even before Lane A's /api/messages is live;
// the API stays the source of truth for *sending* (see ThreadView).
//
// AUTH: gated on env.ADMIN_KEY passed as ?key=… — identical gate to the
// existing admin page, so the captain logs in once with the same secret.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import ThreadList from "../../../components/admin/ThreadList";
import "../../../components/admin/admin-inbox.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innboks · Monterosso" };

// Collapse the messages table into one thread per reservation code.
// Lane D schema (db/schema.sql): messages(id, code, sender, user_id, body,
// created, read_at). We alias body->text, created->ts for the components.
async function loadThreads(db) {
  let rows = [];
  try {
    const r = await db
      .prepare(
        "SELECT code, sender, body, created, read_at FROM messages ORDER BY created ASC"
      )
      .all();
    rows = r?.results || [];
  } catch {
    return []; // table not migrated yet
  }

  const byCode = new Map();
  for (const m of rows) {
    if (!m.code) continue;
    let t = byCode.get(m.code);
    if (!t) {
      t = { code: m.code, name: null, contact: null, last: "", ts: null, unread: 0 };
      byCode.set(m.code, t);
    }
    t.last = m.body;
    t.ts = m.created;
    // Unread = customer messages the captain hasn't read (read_at is null).
    if (m.sender === "customer" && !m.read_at) t.unread += 1;
  }

  // Enrich name/contact from the events log (the booking enquiry carries
  // phone/email per reservation code). Best-effort.
  try {
    const e = await db
      .prepare(
        "SELECT code, phone, email FROM events WHERE code IS NOT NULL AND type IN ('whatsapp','sms','call','lead') ORDER BY id DESC"
      )
      .all();
    for (const ev of e?.results || []) {
      const t = byCode.get(ev.code);
      if (t && !t.contact) t.contact = [ev.phone, ev.email].filter(Boolean).join(" · ") || null;
    }
  } catch {
    /* events optional */
  }

  // Enrich name from a guest account (Lane D users.name) when the chat is
  // tied to a user_id. Best-effort; degrades to "Gjest" in the list.
  try {
    const u = await db
      .prepare(
        "SELECT m.code AS code, u.name AS name FROM messages m JOIN users u ON u.id = m.user_id WHERE u.name IS NOT NULL"
      )
      .all();
    for (const row of u?.results || []) {
      const t = byCode.get(row.code);
      if (t && !t.name) t.name = row.name;
    }
  } catch {
    /* users optional */
  }

  return [...byCode.values()].sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
}

export default async function Inbox({ searchParams }) {
  const sp = (await searchParams) || {};
  const key = sp.key || "";

  let env;
  try {
    ({ env } = getCloudflareContext());
  } catch {
    env = null;
  }
  const adminKey = env?.ADMIN_KEY;
  const authed = !!adminKey && key === adminKey;

  if (!authed) {
    return (
      <main className="cx-login">
        <form method="GET">
          <h1>Innboks</h1>
          <input name="key" type="password" placeholder="Passord" autoFocus />
          <button type="submit">Logg inn</button>
          {key && adminKey ? <p className="cx-err">Feil passord.</p> : null}
          {!adminKey ? <p className="cx-err">Kjør på den deployede siden (Cloudflare).</p> : null}
        </form>
      </main>
    );
  }

  const threads = env?.DB ? await loadThreads(env.DB) : [];

  return (
    // NOTE (Lane G): wrap in the dashboard shell once it lands —
    // <DashboardShell active="chat"> … </DashboardShell>
    <main className="cx">
      <div className="cx-shell">
        <div className="cx-head">
          <h1>Innboks</h1>
          <span className="cx-sub">Skipper · {threads.length} samtaler</span>
        </div>
        <ThreadList threads={threads} />
      </div>
    </main>
  );
}

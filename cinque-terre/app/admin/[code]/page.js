// Lane C · Admin / captain inbox — single thread (/admin/[code]).
//
// Opens one reservation's conversation so the captain can read and reply.
// Messages are read server-side from Lane D's `messages` table; the reply
// box (ThreadView, client) POSTs to Lane A's /api/messages.
//
// AUTH: same ADMIN_KEY ?key=… gate as /admin/inbox. The key is forwarded
// to ThreadView so the send request can be authorised by the API.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import ThreadView from "../../../components/admin/ThreadView";
import "../../../components/admin/admin-inbox.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Samtale · Monterosso" };

// Lane D schema (db/schema.sql): messages(id, code, sender, user_id, body,
// created, read_at). Alias body->text, created->ts for ThreadView. `sender`
// may be customer | captain | admin; treat admin as the captain side.
async function loadThread(db, code) {
  let messages = [];
  try {
    const r = await db
      .prepare("SELECT id, code, sender, body, created FROM messages WHERE code = ? ORDER BY created ASC")
      .bind(code)
      .all();
    messages = (r?.results || []).map((m) => ({
      id: String(m.id),
      code: m.code,
      sender: m.sender === "admin" ? "captain" : m.sender,
      text: m.body,
      ts: m.created,
    }));
  } catch {
    messages = []; // table not migrated yet
  }

  let name = null;
  try {
    const u = await db
      .prepare(
        "SELECT u.name AS name FROM messages m JOIN users u ON u.id = m.user_id WHERE m.code = ? AND u.name IS NOT NULL LIMIT 1"
      )
      .bind(code)
      .first();
    if (u) name = u.name;
  } catch {
    /* users optional */
  }

  let contact = null;
  try {
    const ev = await db
      .prepare(
        "SELECT phone, email FROM events WHERE code = ? AND type IN ('whatsapp','sms','call','lead') ORDER BY id DESC LIMIT 1"
      )
      .bind(code)
      .first();
    if (ev) contact = [ev.phone, ev.email].filter(Boolean).join(" · ") || null;
  } catch {
    /* events optional */
  }

  return { messages, name, contact };
}

export default async function Thread({ params, searchParams }) {
  const { code: raw } = (await params) || {};
  const code = decodeURIComponent(raw || "");
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
          <h1>Samtale</h1>
          <input name="key" type="password" placeholder="Passord" autoFocus />
          <button type="submit">Logg inn</button>
          {key && adminKey ? <p className="cx-err">Feil passord.</p> : null}
          {!adminKey ? <p className="cx-err">Kjør på den deployede siden (Cloudflare).</p> : null}
        </form>
      </main>
    );
  }

  const { messages, name, contact } = env?.DB
    ? await loadThread(env.DB, code)
    : { messages: [], name: null, contact: null };

  return (
    // NOTE (Lane G): wrap in the dashboard shell once it lands.
    <main className="cx">
      <ThreadView code={code} name={name} contact={contact} initialMessages={messages} adminKey={key} />
    </main>
  );
}

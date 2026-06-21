// Chat API — messages for one reservation code (Lane A, wired to our own D1).
//   GET  /api/messages?code=MT-...   -> { messages: [{id, sender, text, ts}] }
//   POST /api/messages  { code, sender, text } -> { message }
//
// Persists to the D1 `messages` table via lib/db (Lane D). In local dev (no D1
// binding) it falls back to an in-memory store so the thread UI still works.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { listMessages, addMessage } from "../../../lib/db";

export const dynamic = "force-dynamic";

const SENDERS = new Set(["customer", "captain", "admin"]);

// view shape the chat UI expects: { id, sender, text, ts }
const toView = (r) => ({
  id: r.id,
  sender: r.sender === "admin" ? "captain" : r.sender,
  text: r.body ?? r.text ?? "",
  ts: r.created ? Date.parse(r.created) || Date.now() : r.ts ?? Date.now(),
});

// local-dev fallback store (used only when there is no D1 binding)
const memStore = new Map();
const mem = (code) => {
  if (!memStore.has(code)) memStore.set(code, []);
  return memStore.get(code);
};

function getDB() {
  try {
    return getCloudflareContext()?.env?.DB ?? null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const code = (new URL(request.url).searchParams.get("code") || "").trim();
  if (!code) return Response.json({ error: "Missing reservation code." }, { status: 400 });
  const db = getDB();
  if (!db) return Response.json({ messages: mem(code).map(toView) });
  const rows = await listMessages(db, code);
  return Response.json({ messages: rows.map(toView) });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const code = (body.code || "").trim();
  const sender = (body.sender || "customer").trim();
  const text = (body.text || "").trim().slice(0, 4000);
  if (!code) return Response.json({ error: "Missing reservation code." }, { status: 400 });
  if (!SENDERS.has(sender)) return Response.json({ error: "Unknown sender." }, { status: 400 });
  if (!text) return Response.json({ error: "Empty message." }, { status: 400 });

  const db = getDB();
  if (!db) {
    const m = { id: crypto.randomUUID(), sender, text, ts: Date.now() };
    mem(code).push(m);
    return Response.json({ message: m }, { status: 201 });
  }
  const row = await addMessage(db, { code, sender, body: text });
  return Response.json({ message: toView(row) }, { status: 201 });
}

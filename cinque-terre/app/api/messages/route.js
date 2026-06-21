// Lane A · Chat API — messages for one reservation code.
//   GET  /api/messages?code=ABC123   -> { messages: [...] }
//   POST /api/messages  { code, sender, text } -> { message: {...} }
//
// STUB: this keeps messages in an in-process Map so the thread UI works
// end-to-end during development. It is NOT persistent (resets on reload /
// per worker isolate) and is single-instance only.
//
// TODO (wire to Lane D — DO NOT edit lib/db.js from this lane):
//   Replace the in-memory store with the D1-backed helpers Lane D exposes
//   from `cinque-terre/lib/db.js`, e.g.
//     import { listMessages, addMessage } from "../../../lib/db";
//   backed by the `messages` table (code, sender, text, ts) described in
//   COORDINATION.md (Lane D). On Cloudflare, the D1 binding is reachable via
//   getCloudflareContext().env.DB (see app/admin/page.js for the pattern).

export const dynamic = "force-dynamic";

const SENDERS = new Set(["customer", "captain"]);

// In-memory dev store: code -> [{ id, sender, text, ts }]
const store = new Map();

function getThread(code) {
  if (!store.has(code)) store.set(code, []);
  return store.get(code);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "").trim();
  if (!code) {
    return Response.json({ error: "Missing reservation code." }, { status: 400 });
  }

  // TODO(Lane D): const messages = await listMessages(code);
  const messages = getThread(code);
  return Response.json({ messages });
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
  const text = (body.text || "").trim();

  if (!code) {
    return Response.json({ error: "Missing reservation code." }, { status: 400 });
  }
  if (!SENDERS.has(sender)) {
    return Response.json({ error: "Unknown sender." }, { status: 400 });
  }
  if (!text) {
    return Response.json({ error: "Empty message." }, { status: 400 });
  }

  const message = {
    id: crypto.randomUUID(),
    sender,
    text,
    ts: Date.now(),
  };

  // TODO(Lane D): await addMessage({ code, sender, text, ts: message.ts });
  getThread(code).push(message);

  return Response.json({ message }, { status: 201 });
}

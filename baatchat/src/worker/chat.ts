// Phase 2 — chat API (contacts, threads, messages). All gated by the JWT and by real
// eligibility: an investor and a loaner may chat only if the investor holds an order in
// one of that loaner's loans. Polling-based (no WebSockets) per the ROADMAP.

import type { Env } from "./index";
import type { SessionUser } from "./auth";

const MAX_BODY = 4000;

export interface Contact {
  id: number; // loaner_id (for investors) or investor user_id (for loaners)
  role: "investor" | "loaner";
  name: string | null;
  threadId: number | null; // existing thread, if any
}

// Eligibility: does this investor↔loaner pair share at least one order?
async function eligible(env: Env, investorId: number, loanerId: number): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT 1 FROM orders o JOIN loans l ON o.loan_id = l.loan_id
      WHERE o.user_id = ? AND l.loaner_id = ? LIMIT 1`
  )
    .bind(investorId, loanerId)
    .first();
  return !!row;
}

// Who the logged-in user is allowed to chat with.
export async function listContacts(env: Env, user: SessionUser): Promise<Contact[]> {
  if (user.role === "investor") {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT ln.loaner_id AS id, ln.company_name AS name, t.id AS threadId
         FROM orders o
         JOIN loans  l  ON o.loan_id = l.loan_id
         JOIN loaners ln ON l.loaner_id = ln.loaner_id
         LEFT JOIN threads t ON t.loaner_id = ln.loaner_id AND t.investor_id = ?
        WHERE o.user_id = ?
        ORDER BY ln.company_name`
    )
      .bind(user.id, user.id)
      .all<{ id: number; name: string | null; threadId: number | null }>();
    return (results ?? []).map((r) => ({ ...r, role: "loaner" as const }));
  }
  if (user.role === "loaner") {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT iv.user_id AS id, iv.name AS name, t.id AS threadId
         FROM orders o
         JOIN loans l ON o.loan_id = l.loan_id
         JOIN investors iv ON o.user_id = iv.user_id
         LEFT JOIN threads t ON t.investor_id = iv.user_id AND t.loaner_id = ?
        WHERE l.loaner_id = ?
        ORDER BY iv.name`
    )
      .bind(user.id, user.id)
      .all<{ id: number; name: string | null; threadId: number | null }>();
    return (results ?? []).map((r) => ({ ...r, role: "investor" as const }));
  }
  return []; // admins use the moderation endpoints, not these
}

// The user's conversations, newest first, with the other party's name + unread count.
export async function listThreads(env: Env, user: SessionUser) {
  const col = user.role === "investor" ? "investor_id" : "loaner_id";
  const otherJoin =
    user.role === "investor"
      ? `JOIN loaners p ON p.loaner_id = t.loaner_id`
      : `JOIN investors p ON p.user_id = t.investor_id`;
  const otherName = user.role === "investor" ? "p.company_name" : "p.name";
  const otherId = user.role === "investor" ? "t.loaner_id" : "t.investor_id";

  const { results } = await env.DB.prepare(
    `SELECT t.id, ${otherId} AS contactId, ${otherName} AS contactName,
            t.status, t.last_message_at AS lastMessageAt, t.last_message_preview AS preview,
            (SELECT count(*) FROM messages m
              WHERE m.thread_id = t.id AND m.deleted_at IS NULL
                AND m.sender_oblinor_id != ?
                AND m.id > COALESCE(
                  (SELECT last_read_message_id FROM read_state
                    WHERE thread_id = t.id AND reader_oblinor_id = ?), 0)
            ) AS unread
       FROM threads t ${otherJoin}
      WHERE t.${col} = ?
      ORDER BY t.last_message_at DESC NULLS LAST, t.id DESC`
  )
    .bind(user.id, user.id, user.id)
    .all();
  return results ?? [];
}

// Open (or fetch) the thread between the user and a contact. Validates eligibility.
export async function openThread(
  env: Env,
  user: SessionUser,
  contactId: number
): Promise<{ id: number } | null> {
  const investorId = user.role === "investor" ? user.id : contactId;
  const loanerId = user.role === "loaner" ? user.id : contactId;
  if (!(await eligible(env, investorId, loanerId))) return null;

  await env.DB.prepare(
    `INSERT INTO threads (loaner_id, investor_id) VALUES (?, ?)
     ON CONFLICT(loaner_id, investor_id) DO NOTHING`
  )
    .bind(loanerId, investorId)
    .run();

  return env.DB.prepare(`SELECT id FROM threads WHERE loaner_id = ? AND investor_id = ?`)
    .bind(loanerId, investorId)
    .first<{ id: number }>();
}

// Confirm the user is a participant in the thread (authorization for message access).
async function participantThread(env: Env, user: SessionUser, threadId: number) {
  const col = user.role === "investor" ? "investor_id" : "loaner_id";
  return env.DB.prepare(`SELECT * FROM threads WHERE id = ? AND ${col} = ?`)
    .bind(threadId, user.id)
    .first<{ id: number; status: string }>();
}

export async function getMessages(
  env: Env,
  user: SessionUser,
  threadId: number,
  since: number
) {
  const thread = await participantThread(env, user, threadId);
  if (!thread) return null; // not a participant → caller returns 403/404

  const { results } = await env.DB.prepare(
    `SELECT id, sender_oblinor_id AS senderId, sender_role AS senderRole, body,
            created_at AS createdAt, edited_at AS editedAt
       FROM messages
      WHERE thread_id = ? AND deleted_at IS NULL AND id > ?
      ORDER BY id`
  )
    .bind(threadId, since)
    .all();

  // Mark everything we just returned as read for this user.
  const maxId = (results ?? []).reduce((m: number, r: any) => Math.max(m, r.id), since);
  if (maxId > since) await markRead(env, user, threadId, maxId);

  return results ?? [];
}

export async function postMessage(
  env: Env,
  user: SessionUser,
  threadId: number,
  rawBody: string
): Promise<{ id: number } | null | "locked"> {
  const thread = await participantThread(env, user, threadId);
  if (!thread) return null;
  if (thread.status !== "active") return "locked";

  const body = rawBody.trim().slice(0, MAX_BODY);
  if (!body) return null;
  const preview = body.slice(0, 100);

  const inserted = await env.DB.prepare(
    `INSERT INTO messages (thread_id, sender_oblinor_id, sender_role, body)
     VALUES (?, ?, ?, ?) RETURNING id`
  )
    .bind(threadId, user.id, user.role, body)
    .first<{ id: number }>();

  await env.DB.prepare(
    `UPDATE threads SET last_message_at = datetime('now'), last_message_preview = ? WHERE id = ?`
  )
    .bind(preview, threadId)
    .run();

  // Sender has implicitly read their own message.
  if (inserted) await markRead(env, user, threadId, inserted.id);
  return inserted;
}

// The specific loans a conversation is about: the loaner's loans this investor actually
// holds an order in. Gives both parties context — which property/loan the other is asking
// about (a loaner has many loans; an investor may span several). Keyed by contact (not
// thread) so it works before the first message is sent. Returns [] if the pair shares no
// orders (i.e. not eligible) — no leak.
export async function contactLoans(
  env: Env,
  user: SessionUser,
  contactId: number
): Promise<{ loanId: number; address: string | null; amount: number | null }[]> {
  const investorId = user.role === "investor" ? user.id : contactId;
  const loanerId = user.role === "loaner" ? user.id : contactId;

  const { results } = await env.DB.prepare(
    `SELECT DISTINCT l.loan_id AS loanId, l.address AS address, l.amount AS amount
       FROM orders o JOIN loans l ON o.loan_id = l.loan_id
      WHERE o.user_id = ? AND l.loaner_id = ?
      ORDER BY l.address, l.loan_id`
  )
    .bind(investorId, loanerId)
    .all<{ loanId: number; address: string | null; amount: number | null }>();
  return results ?? [];
}

export async function markRead(
  env: Env,
  user: SessionUser,
  threadId: number,
  lastMessageId: number
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO read_state (thread_id, reader_oblinor_id, last_read_message_id, last_read_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(thread_id, reader_oblinor_id) DO UPDATE SET
       last_read_message_id = max(last_read_message_id, excluded.last_read_message_id),
       last_read_at = excluded.last_read_at`
  )
    .bind(threadId, user.id, lastMessageId)
    .run();
}

// Admin ↔ skipper SUPPORT chat. A direct line between the platform admin (Kristian) and a
// skipper, separate from the reservation-bound customer↔skipper threads and from the
// read-only oversight. One support thread per skipper (admin_threads, keyed by skipper_id);
// messages live in the shared `messages` table keyed by admin_thread_id. The admin side is a
// single platform entity: admin messages are sender_role 'admin', party 0 (the admin
// SessionUser's fixed id). See migration 0005_admin_chat.sql for the model.

import type { Env } from "./index";
import type { SessionUser } from "./auth";

const MAX_BODY = 4000;
// read_state namespace for support threads: a large negative offset that can't collide with a
// 1-1 thread id (positive) or a group thread cursor (small negative, -tripThreadId).
const ADMIN_READ_NS = -1_000_000_000;

const MESSAGES_SELECT = `SELECT id, sender_party_id AS senderId, sender_role AS senderRole, body,
            created_at AS createdAt, edited_at AS editedAt
       FROM messages
      WHERE admin_thread_id = ? AND deleted_at IS NULL AND id > ?
      ORDER BY id`;

/** Ensure a support thread exists for a skipper; return its id. */
async function ensureAdminThread(env: Env, skipperId: number): Promise<number> {
  await env.DB.prepare(
    `INSERT INTO admin_threads (skipper_id) VALUES (?) ON CONFLICT(skipper_id) DO NOTHING`
  )
    .bind(skipperId)
    .run();
  const row = await env.DB.prepare(`SELECT id FROM admin_threads WHERE skipper_id = ?`)
    .bind(skipperId)
    .first<{ id: number }>();
  return row!.id;
}

/** Read-state for a support thread, namespaced under the negative offset. */
async function markAdminRead(
  env: Env,
  adminThreadId: number,
  readerPartyId: number,
  lastMessageId: number
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO read_state (thread_id, reader_party_id, last_read_message_id, last_read_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(thread_id, reader_party_id) DO UPDATE SET
       last_read_message_id = max(last_read_message_id, excluded.last_read_message_id),
       last_read_at = excluded.last_read_at`
  )
    .bind(ADMIN_READ_NS - adminThreadId, readerPartyId, lastMessageId)
    .run();
}

export interface SupportMessage {
  id: number;
  senderId: number;
  senderRole: string; // 'admin' | 'skipper'
  body: string;
  createdAt: string;
  editedAt: string | null;
}

// --- admin side (admin-authed) ---------------------------------------------

export interface AdminSupportThread {
  id: number;
  skipperId: number;
  skipperName: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  unread: number;
}

/** Open (or lazily create) the support thread with a given skipper. Returns null if the
 *  skipper doesn't exist. */
export async function adminOpenSupportThread(
  env: Env,
  skipperId: number
): Promise<{ id: number; skipperId: number; skipperName: string | null } | null> {
  const skipper = await env.DB.prepare(
    `SELECT skipper_id AS id, COALESCE(listing_title, boat_name, name) AS name
       FROM skippers WHERE skipper_id = ?`
  )
    .bind(skipperId)
    .first<{ id: number; name: string | null }>();
  if (!skipper) return null;
  const id = await ensureAdminThread(env, skipperId);
  return { id, skipperId, skipperName: skipper.name };
}

/** Every support thread (for an admin overview), newest first, with unread-from-skipper. */
export async function adminListSupportThreads(env: Env): Promise<AdminSupportThread[]> {
  const { results } = await env.DB.prepare(
    `SELECT a.id, a.skipper_id AS skipperId,
            COALESCE(s.listing_title, s.boat_name, s.name) AS skipperName,
            a.status, a.last_message_at AS lastMessageAt, a.last_message_preview AS preview,
            (SELECT count(*) FROM messages m
              WHERE m.admin_thread_id = a.id AND m.deleted_at IS NULL AND m.sender_role = 'skipper'
                AND m.id > COALESCE((SELECT last_read_message_id FROM read_state
                      WHERE thread_id = ? - a.id AND reader_party_id = 0), 0)) AS unread
       FROM admin_threads a
       LEFT JOIN skippers s ON s.skipper_id = a.skipper_id
      ORDER BY a.last_message_at DESC NULLS LAST, a.id DESC`
  )
    .bind(ADMIN_READ_NS)
    .all<any>();
  return (results ?? []).map((r) => ({
    id: r.id,
    skipperId: r.skipperId,
    skipperName: r.skipperName ?? null,
    status: r.status,
    lastMessageAt: r.lastMessageAt ?? null,
    preview: r.preview ?? null,
    unread: Number(r.unread ?? 0),
  }));
}

/** Support-thread messages for the admin. Marks the admin (party 0) read up to the newest. */
export async function adminSupportMessages(
  env: Env,
  adminThreadId: number,
  since: number
): Promise<{ thread: AdminSupportThread; messages: SupportMessage[] } | null> {
  const thread = await env.DB.prepare(
    `SELECT a.id, a.skipper_id AS skipperId,
            COALESCE(s.listing_title, s.boat_name, s.name) AS skipperName,
            a.status, a.last_message_at AS lastMessageAt, a.last_message_preview AS preview
       FROM admin_threads a
       LEFT JOIN skippers s ON s.skipper_id = a.skipper_id
      WHERE a.id = ?`
  )
    .bind(adminThreadId)
    .first<any>();
  if (!thread) return null;

  const { results } = await env.DB.prepare(MESSAGES_SELECT)
    .bind(adminThreadId, since)
    .all<SupportMessage>();
  const maxId = (results ?? []).reduce((m: number, r: any) => Math.max(m, r.id), since);
  if (maxId > since) await markAdminRead(env, adminThreadId, 0, maxId);

  return {
    thread: {
      id: thread.id,
      skipperId: thread.skipperId,
      skipperName: thread.skipperName ?? null,
      status: thread.status,
      lastMessageAt: thread.lastMessageAt ?? null,
      preview: thread.preview ?? null,
      unread: 0,
    },
    messages: results ?? [],
  };
}

/** Admin posts a support message (sender_role 'admin', party 0). */
export async function adminPostSupportMessage(
  env: Env,
  adminThreadId: number,
  rawBody: string
): Promise<{ id: number } | null | "locked"> {
  const thread = await env.DB.prepare(`SELECT id, status FROM admin_threads WHERE id = ?`)
    .bind(adminThreadId)
    .first<{ id: number; status: string }>();
  if (!thread) return null;
  if (thread.status !== "active") return "locked";

  const body = rawBody.trim().slice(0, MAX_BODY);
  if (!body) return null;
  const preview = body.slice(0, 100);

  const inserted = await env.DB.prepare(
    `INSERT INTO messages (admin_thread_id, sender_party_id, sender_role, body)
     VALUES (?, 0, 'admin', ?) RETURNING id`
  )
    .bind(adminThreadId, body)
    .first<{ id: number }>();

  await env.DB.prepare(
    `UPDATE admin_threads SET last_message_at = datetime('now'), last_message_preview = ? WHERE id = ?`
  )
    .bind(preview, adminThreadId)
    .run();

  if (inserted) await markAdminRead(env, adminThreadId, 0, inserted.id);
  return inserted;
}

// --- skipper side (skipper-authed) -----------------------------------------

export interface SkipperSupportThread {
  id: number;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  unread: number;
}

/** The skipper's own support thread (created lazily, so it's always available to open). */
export async function skipperSupportThread(
  env: Env,
  user: SessionUser
): Promise<SkipperSupportThread> {
  const id = await ensureAdminThread(env, user.id);
  const row = await env.DB.prepare(
    `SELECT status, last_message_at AS lastMessageAt, last_message_preview AS preview
       FROM admin_threads WHERE id = ?`
  )
    .bind(id)
    .first<{ status: string; lastMessageAt: string | null; preview: string | null }>();
  const u = await env.DB.prepare(
    `SELECT count(*) AS n FROM messages m
      WHERE m.admin_thread_id = ? AND m.deleted_at IS NULL AND m.sender_role = 'admin'
        AND m.id > COALESCE((SELECT last_read_message_id FROM read_state
              WHERE thread_id = ? AND reader_party_id = ?), 0)`
  )
    .bind(id, ADMIN_READ_NS - id, user.id)
    .first<{ n: number }>();
  return {
    id,
    status: row?.status ?? "active",
    lastMessageAt: row?.lastMessageAt ?? null,
    preview: row?.preview ?? null,
    unread: Number(u?.n ?? 0),
  };
}

/** Confirm the thread belongs to this skipper (authorization). */
async function ownsSupportThread(
  env: Env,
  user: SessionUser,
  adminThreadId: number
): Promise<{ id: number; status: string } | null> {
  const t = await env.DB.prepare(
    `SELECT id, status FROM admin_threads WHERE id = ? AND skipper_id = ?`
  )
    .bind(adminThreadId, user.id)
    .first<{ id: number; status: string }>();
  return t ?? null;
}

/** Support-thread messages for the skipper. Marks the skipper read up to the newest. */
export async function skipperSupportMessages(
  env: Env,
  user: SessionUser,
  adminThreadId: number,
  since: number
): Promise<SupportMessage[] | null> {
  if (!(await ownsSupportThread(env, user, adminThreadId))) return null;
  const { results } = await env.DB.prepare(MESSAGES_SELECT)
    .bind(adminThreadId, since)
    .all<SupportMessage>();
  const maxId = (results ?? []).reduce((m: number, r: any) => Math.max(m, r.id), since);
  if (maxId > since) await markAdminRead(env, adminThreadId, user.id, maxId);
  return results ?? [];
}

/** Skipper posts a support reply (sender_role 'skipper'). */
export async function skipperPostSupportMessage(
  env: Env,
  user: SessionUser,
  adminThreadId: number,
  rawBody: string
): Promise<{ id: number } | null | "locked"> {
  const t = await ownsSupportThread(env, user, adminThreadId);
  if (!t) return null;
  if (t.status !== "active") return "locked";

  const body = rawBody.trim().slice(0, MAX_BODY);
  if (!body) return null;
  const preview = body.slice(0, 100);

  const inserted = await env.DB.prepare(
    `INSERT INTO messages (admin_thread_id, sender_party_id, sender_role, body)
     VALUES (?, ?, 'skipper', ?) RETURNING id`
  )
    .bind(adminThreadId, user.id, body)
    .first<{ id: number }>();

  await env.DB.prepare(
    `UPDATE admin_threads SET last_message_at = datetime('now'), last_message_preview = ? WHERE id = ?`
  )
    .bind(preview, adminThreadId)
    .run();

  if (inserted) await markAdminRead(env, adminThreadId, user.id, inserted.id);
  return inserted;
}

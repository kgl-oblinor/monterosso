// Chat API (contacts, threads, messages). All gated by the JWT and by real eligibility:
// a customer and a skipper may chat only when they share at least one RESERVATION.
// Polling-based (no WebSockets).

import type { Env } from "./index";
import type { SessionUser } from "./auth";

const MAX_BODY = 4000;

export interface Contact {
  id: number; // skipper_id (for customers) or customer_id (for skippers)
  role: "skipper" | "customer";
  name: string | null;
  threadId: number | null; // existing thread, if any
}

// Eligibility: does this customer↔skipper pair share at least one reservation?
async function eligible(env: Env, customerId: number, skipperId: number): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT 1 FROM reservations WHERE customer_id = ? AND skipper_id = ? LIMIT 1`
  )
    .bind(customerId, skipperId)
    .first();
  return !!row;
}

// Who the logged-in user is allowed to chat with.
export async function listContacts(env: Env, user: SessionUser): Promise<Contact[]> {
  if (user.role === "customer") {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT s.skipper_id AS id,
              COALESCE(s.listing_title, s.boat_name, s.name) AS name,
              t.id AS threadId
         FROM reservations r
         JOIN skippers s ON r.skipper_id = s.skipper_id
         LEFT JOIN threads t ON t.skipper_id = s.skipper_id AND t.customer_id = ?
        WHERE r.customer_id = ?
        ORDER BY name`
    )
      .bind(user.id, user.id)
      .all<{ id: number; name: string | null; threadId: number | null }>();
    return (results ?? []).map((r) => ({ ...r, role: "skipper" as const }));
  }
  if (user.role === "skipper") {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT c.customer_id AS id, c.name AS name, t.id AS threadId
         FROM reservations r
         JOIN customers c ON r.customer_id = c.customer_id
         LEFT JOIN threads t ON t.customer_id = c.customer_id AND t.skipper_id = ?
        WHERE r.skipper_id = ?
        ORDER BY c.name`
    )
      .bind(user.id, user.id)
      .all<{ id: number; name: string | null; threadId: number | null }>();
    return (results ?? []).map((r) => ({ ...r, role: "customer" as const }));
  }
  return []; // admins use the moderation endpoints, not these
}

// The user's conversations, newest first, with the other party's name + unread count.
export async function listThreads(env: Env, user: SessionUser) {
  const col = user.role === "customer" ? "customer_id" : "skipper_id";
  const otherJoin =
    user.role === "customer"
      ? `JOIN skippers p ON p.skipper_id = t.skipper_id`
      : `JOIN customers p ON p.customer_id = t.customer_id`;
  const otherName =
    user.role === "customer"
      ? "COALESCE(p.listing_title, p.boat_name, p.name)"
      : "p.name";
  const otherId = user.role === "customer" ? "t.skipper_id" : "t.customer_id";

  const { results } = await env.DB.prepare(
    `SELECT t.id, ${otherId} AS contactId, ${otherName} AS contactName,
            t.status, t.last_message_at AS lastMessageAt, t.last_message_preview AS preview,
            (SELECT count(*) FROM messages m
              WHERE m.thread_id = t.id AND m.deleted_at IS NULL
                AND m.sender_party_id != ?
                AND m.id > COALESCE(
                  (SELECT last_read_message_id FROM read_state
                    WHERE thread_id = t.id AND reader_party_id = ?), 0)
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
  const customerId = user.role === "customer" ? user.id : contactId;
  const skipperId = user.role === "skipper" ? user.id : contactId;
  if (!(await eligible(env, customerId, skipperId))) return null;

  await env.DB.prepare(
    `INSERT INTO threads (skipper_id, customer_id) VALUES (?, ?)
     ON CONFLICT(skipper_id, customer_id) DO NOTHING`
  )
    .bind(skipperId, customerId)
    .run();

  return env.DB.prepare(`SELECT id FROM threads WHERE skipper_id = ? AND customer_id = ?`)
    .bind(skipperId, customerId)
    .first<{ id: number }>();
}

// Confirm the user is a participant in the thread (authorization for message access).
async function participantThread(env: Env, user: SessionUser, threadId: number) {
  const col = user.role === "customer" ? "customer_id" : "skipper_id";
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
    `SELECT id, sender_party_id AS senderId, sender_role AS senderRole, body,
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
    `INSERT INTO messages (thread_id, sender_party_id, sender_role, body)
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

// The reservation(s) a conversation is about: the trips this customer↔skipper pair share.
// Gives both parties context (which booking the other is asking about). Keyed by contact
// so it works before the first message is sent. Returns [] if they share none (no leak).
export async function contactReservations(
  env: Env,
  user: SessionUser,
  contactId: number
): Promise<{ code: string; tripDate: string | null; guests: number | null; status: string }[]> {
  const customerId = user.role === "customer" ? user.id : contactId;
  const skipperId = user.role === "skipper" ? user.id : contactId;

  const { results } = await env.DB.prepare(
    `SELECT reservation_code AS code, trip_date AS tripDate, guests, status
       FROM reservations
      WHERE customer_id = ? AND skipper_id = ?
      ORDER BY trip_date DESC, reservation_id DESC`
  )
    .bind(customerId, skipperId)
    .all<{ code: string; tripDate: string | null; guests: number | null; status: string }>();
  return results ?? [];
}

// All of the logged-in user's reservations (their "Turer"). Role decides the filter and
// which counterpart name to join: a customer sees their skipper/boat, a skipper sees the
// customer ("who's aboard"). Newest trip first.
export interface MyReservation {
  code: string;
  tripDate: string | null;
  guests: number | null;
  status: string;
  contactName: string | null; // skipper/boat name (customer view) or customer name (skipper view)
}

export async function myReservations(env: Env, user: SessionUser): Promise<MyReservation[]> {
  if (user.role === "customer") {
    const { results } = await env.DB.prepare(
      `SELECT r.reservation_code AS code, r.trip_date AS tripDate, r.guests, r.status,
              COALESCE(s.listing_title, s.boat_name, s.name) AS contactName
         FROM reservations r
         JOIN skippers s ON r.skipper_id = s.skipper_id
        WHERE r.customer_id = ?
        ORDER BY r.trip_date DESC, r.reservation_id DESC`
    )
      .bind(user.id)
      .all<MyReservation>();
    return results ?? [];
  }
  if (user.role === "skipper") {
    const { results } = await env.DB.prepare(
      `SELECT r.reservation_code AS code, r.trip_date AS tripDate, r.guests, r.status,
              c.name AS contactName
         FROM reservations r
         LEFT JOIN customers c ON r.customer_id = c.customer_id
        WHERE r.skipper_id = ?
        ORDER BY r.status = 'requested' DESC, r.trip_date DESC, r.reservation_id DESC`
    )
      .bind(user.id)
      .all<MyReservation>();
    return results ?? [];
  }
  return [];
}

// --- profile (the logged-in user's own contact details) --------------------
// Read from chat_accounts (the auth row) joined with the role's source table
// (customers or skippers) for the on-file phone. name/email live on both — we
// prefer the account's display_name/email (what the user controls) over the
// source row, falling back to the source row when the account field is blank.

export interface MyProfile {
  name: string | null;
  email: string;
  phone: string | null;
}

export async function getMyProfile(env: Env, user: SessionUser): Promise<MyProfile> {
  if (user.role === "customer") {
    const row = await env.DB.prepare(
      `SELECT COALESCE(ca.display_name, c.name) AS name,
              COALESCE(ca.email, c.email) AS email,
              c.phone AS phone
         FROM customers c
         LEFT JOIN chat_accounts ca ON ca.party_id = c.customer_id AND ca.role = 'customer'
        WHERE c.customer_id = ?`
    )
      .bind(user.id)
      .first<{ name: string | null; email: string | null; phone: string | null }>();
    return { name: row?.name ?? user.name, email: row?.email ?? user.email, phone: row?.phone ?? null };
  }
  if (user.role === "skipper") {
    const row = await env.DB.prepare(
      `SELECT COALESCE(ca.display_name, s.name) AS name,
              COALESCE(ca.email, s.email) AS email,
              s.phone AS phone
         FROM skippers s
         LEFT JOIN chat_accounts ca ON ca.party_id = s.skipper_id AND ca.role = 'skipper'
        WHERE s.skipper_id = ?`
    )
      .bind(user.id)
      .first<{ name: string | null; email: string | null; phone: string | null }>();
    return { name: row?.name ?? user.name, email: row?.email ?? user.email, phone: row?.phone ?? null };
  }
  return { name: user.name, email: user.email, phone: null };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose phone check: allows +, spaces, dashes, parens; needs 6–20 digits.
const PHONE_RE = /^[+\d][\d\s().-]{5,19}$/;

export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
}

// Update the user's name/email/phone. Writes name+email to the role's source table
// (customers/skippers) and mirrors display_name+email onto chat_accounts (the auth row),
// so the next login/token carries the new values. Phone lives only on the source table.
// Returns the refreshed profile, or { error } on validation failure.
export async function updateMyProfile(
  env: Env,
  user: SessionUser,
  input: ProfileUpdate
): Promise<MyProfile | { error: string }> {
  if (user.role !== "customer" && user.role !== "skipper") {
    return { error: "Profil er kun for kunder og skippere" };
  }

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();

  if (email !== undefined && email !== "" && !EMAIL_RE.test(email)) {
    return { error: "Oppgi en gyldig e-postadresse" };
  }
  if (phone !== undefined && phone !== "" && !PHONE_RE.test(phone)) {
    return { error: "Oppgi et gyldig telefonnummer" };
  }
  // At least one contact channel must remain — don't let the user erase both.
  const current = await getMyProfile(env, user);
  const nextEmail = email !== undefined ? email : current.email;
  const nextPhone = phone !== undefined ? phone : current.phone;
  if (!nextEmail && !nextPhone) {
    return { error: "Behold minst én kontaktmåte — e-post eller telefon" };
  }

  if (user.role === "customer") {
    await env.DB.prepare(
      `UPDATE customers SET
         name  = COALESCE(?, name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone)
       WHERE customer_id = ?`
    )
      .bind(name ?? null, email ?? null, phone ?? null, user.id)
      .run();
  } else {
    await env.DB.prepare(
      `UPDATE skippers SET
         name  = COALESCE(?, name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone)
       WHERE skipper_id = ?`
    )
      .bind(name ?? null, email ?? null, phone ?? null, user.id)
      .run();
  }

  // Mirror name/email onto the auth row (matched by party_id + role) so login stays in sync.
  await env.DB.prepare(
    `UPDATE chat_accounts SET
       display_name = COALESCE(?, display_name),
       email        = COALESCE(?, email)
     WHERE party_id = ? AND role = ?`
  )
    .bind(name ?? null, email ?? null, user.id, user.role)
    .run();

  return getMyProfile(env, user);
}

export async function markRead(
  env: Env,
  user: SessionUser,
  threadId: number,
  lastMessageId: number
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO read_state (thread_id, reader_party_id, last_read_message_id, last_read_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(thread_id, reader_party_id) DO UPDATE SET
       last_read_message_id = max(last_read_message_id, excluded.last_read_message_id),
       last_read_at = excluded.last_read_at`
  )
    .bind(threadId, user.id, lastMessageId)
    .run();
}

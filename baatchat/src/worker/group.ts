// Group chat + invitations ("turfølget").
//
// A reservation/trip can have MANY members (reservation_members). The group of a trip =
// all its members + the reservation's skipper. They share ONE group thread (trip_threads),
// one per reservation; group messages live in `messages` keyed by trip_thread_id.
//
// Invites: a member of a reservation creates a single-use token → a shareable /join link.
// No auto-send (no email/SMS provider yet) — the caller copies/shares the link themselves.
// Joining is passwordless: the link consumer is linked to a (light) customer account, added
// to the group as a 'guest', and logged straight in (reuses passwordlessEntry's account logic).

import type { Env } from "./index";
import type { SessionUser } from "./auth";
import { passwordlessEntry } from "./auth";

const MAX_BODY = 4000;

// --- helpers ----------------------------------------------------------------

/** Is this customer a member of the reservation, OR the reservation's skipper? */
async function isGroupParticipant(
  env: Env,
  user: SessionUser,
  reservationId: number
): Promise<boolean> {
  if (user.role === "skipper") {
    const row = await env.DB.prepare(
      `SELECT 1 FROM reservations WHERE reservation_id = ? AND skipper_id = ? LIMIT 1`
    )
      .bind(reservationId, user.id)
      .first();
    return !!row;
  }
  if (user.role === "customer") {
    const row = await env.DB.prepare(
      `SELECT 1 FROM reservation_members WHERE reservation_id = ? AND customer_id = ? LIMIT 1`
    )
      .bind(reservationId, user.id)
      .first();
    return !!row;
  }
  return false;
}

/** Resolve the reservation a code refers to (id + skipper), or null. */
async function reservationByCode(
  env: Env,
  code: string
): Promise<{ reservationId: number; skipperId: number } | null> {
  const r = await env.DB.prepare(
    `SELECT reservation_id AS reservationId, skipper_id AS skipperId
       FROM reservations WHERE reservation_code = ? LIMIT 1`
  )
    .bind(code.trim().toUpperCase())
    .first<{ reservationId: number; skipperId: number }>();
  return r ?? null;
}

/** Ensure a trip_thread row exists for a reservation; return its id. */
async function ensureTripThread(env: Env, reservationId: number): Promise<number> {
  await env.DB.prepare(
    `INSERT INTO trip_threads (reservation_id) VALUES (?)
     ON CONFLICT(reservation_id) DO NOTHING`
  )
    .bind(reservationId)
    .run();
  const row = await env.DB.prepare(
    `SELECT id FROM trip_threads WHERE reservation_id = ?`
  )
    .bind(reservationId)
    .first<{ id: number }>();
  return row!.id;
}

function token(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  // url-safe base64, no padding
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// --- invites ----------------------------------------------------------------

export interface CreatedInvite {
  token: string;
  link: string;
  reservationCode: string;
}

/** A reservation the user may invite people to (with a count of the people already aboard). */
export interface InvitableTrip {
  reservationCode: string;
  tripDate: string | null;
  memberCount: number;
}

/** Trips the logged-in user can invite their party into. A customer: the reservations they're
 *  a member of. A skipper: the reservations on their listings. */
export async function invitableTrips(env: Env, user: SessionUser): Promise<InvitableTrip[]> {
  if (user.role === "customer") {
    const { results } = await env.DB.prepare(
      `SELECT r.reservation_code AS reservationCode, r.trip_date AS tripDate,
              (SELECT count(*) FROM reservation_members WHERE reservation_id = r.reservation_id) AS memberCount
         FROM reservation_members m
         JOIN reservations r ON r.reservation_id = m.reservation_id
        WHERE m.customer_id = ?
        ORDER BY r.trip_date DESC, r.reservation_id DESC`
    )
      .bind(user.id)
      .all<InvitableTrip>();
    return results ?? [];
  }
  if (user.role === "skipper") {
    const { results } = await env.DB.prepare(
      `SELECT r.reservation_code AS reservationCode, r.trip_date AS tripDate,
              (SELECT count(*) FROM reservation_members WHERE reservation_id = r.reservation_id) AS memberCount
         FROM reservations r
        WHERE r.skipper_id = ?
        ORDER BY r.trip_date DESC, r.reservation_id DESC`
    )
      .bind(user.id)
      .all<InvitableTrip>();
    return results ?? [];
  }
  return [];
}

/** Create a single-use invite for one of the user's reservations and return a shareable link.
 *  `email`/`phone` are optional and only recorded for display — anyone with the link can join. */
export async function createInvite(
  env: Env,
  user: SessionUser,
  reservationCode: string,
  contact: { email?: string; phone?: string }
): Promise<CreatedInvite | { error: string }> {
  const res = await reservationByCode(env, reservationCode);
  if (!res) return { error: "Fant ikke turen" };
  if (!(await isGroupParticipant(env, user, res.reservationId))) {
    return { error: "Du er ikke med på denne turen" };
  }
  // Only customers carry a customer_id as created_by; a skipper inviting is recorded as 0.
  const createdBy = user.role === "customer" ? user.id : 0;

  const tok = token();
  await env.DB.prepare(
    `INSERT INTO invites (token, reservation_id, invited_email, invited_phone, created_by)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      tok,
      res.reservationId,
      contact.email?.trim().toLowerCase() || null,
      contact.phone?.trim() || null,
      createdBy
    )
    .run();

  const base = (env.APP_BASE_URL || "https://monterosso-app.kgl-56a.workers.dev").replace(/\/$/, "");
  return {
    token: tok,
    link: `${base}/join?invite=${tok}`,
    reservationCode: reservationCode.trim().toUpperCase(),
  };
}

// --- joining (passwordless) -------------------------------------------------

export interface InvitePreview {
  reservationCode: string;
  tripDate: string | null;
  invitedEmail: string | null;
  invitedPhone: string | null;
  used: boolean;
}

/** Read-only look at an invite (for the /join landing before the visitor identifies). */
export async function invitepreview(env: Env, tok: string): Promise<InvitePreview | null> {
  const row = await env.DB.prepare(
    `SELECT i.invited_email AS invitedEmail, i.invited_phone AS invitedPhone,
            i.used_at AS usedAt, r.reservation_code AS reservationCode, r.trip_date AS tripDate
       FROM invites i
       JOIN reservations r ON r.reservation_id = i.reservation_id
      WHERE i.token = ? LIMIT 1`
  )
    .bind(tok)
    .first<{
      invitedEmail: string | null; invitedPhone: string | null; usedAt: string | null;
      reservationCode: string; tripDate: string | null;
    }>();
  if (!row) return null;
  return {
    reservationCode: row.reservationCode,
    tripDate: row.tripDate,
    invitedEmail: row.invitedEmail,
    invitedPhone: row.invitedPhone,
    used: !!row.usedAt,
  };
}

export type JoinResult =
  | { ok: true; token: string; user: SessionUser; status: string; reservationCode: string }
  | { ok: false; reason: "invalid_invite" | "used" | "needs_password" | "invalid" };

/** Consume an invite: passwordlessly create/link the visitor's customer account, add them to
 *  the reservation's group as a 'guest', mark the invite used, and return a session JWT.
 *  Reuses passwordlessEntry so the account/JWT path is identical to the main way in. */
export async function joinByInvite(
  env: Env,
  tok: string,
  contact: { email?: string; phone?: string }
): Promise<JoinResult> {
  const invite = await env.DB.prepare(
    `SELECT reservation_id AS reservationId, used_at AS usedAt FROM invites WHERE token = ? LIMIT 1`
  )
    .bind(tok)
    .first<{ reservationId: number; usedAt: string | null }>();
  if (!invite) return { ok: false, reason: "invalid_invite" };
  if (invite.usedAt) return { ok: false, reason: "used" };

  // Passwordless: find/create the customer account + issue the JWT (the exact main-way-in path).
  const entry = await passwordlessEntry(env, contact);
  if (!entry.ok) return { ok: false, reason: entry.reason };

  const customerId = entry.user.id;

  // Add them to the group (idempotent). Skip if somehow already a member.
  await env.DB.prepare(
    `INSERT INTO reservation_members (reservation_id, customer_id, role, invited_by)
     VALUES (?, ?, 'guest', NULL)
     ON CONFLICT(reservation_id, customer_id) DO NOTHING`
  )
    .bind(invite.reservationId, customerId)
    .run();

  await ensureTripThread(env, invite.reservationId);

  // Mark the invite used (single-use). Guard on still-unused so a race can't double-consume.
  await env.DB.prepare(
    `UPDATE invites SET used_at = datetime('now'), used_by = ? WHERE token = ? AND used_at IS NULL`
  )
    .bind(customerId, tok)
    .run();

  const code = await env.DB.prepare(
    `SELECT reservation_code AS code FROM reservations WHERE reservation_id = ?`
  )
    .bind(invite.reservationId)
    .first<{ code: string }>();

  return {
    ok: true,
    token: entry.token,
    user: entry.user,
    status: entry.status,
    reservationCode: code?.code ?? "",
  };
}

// --- group conversations (the trip threads the user belongs to) -------------

export interface TripConversation {
  tripThreadId: number | null; // null until the first message creates the thread
  reservationId: number;
  reservationCode: string;
  tripDate: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  unread: number;
  participantCount: number; // members + skipper
  participantNames: string[]; // member names + skipper/boat, for the header
}

/** Every group/trip conversation the user belongs to. A customer: the reservations they're a
 *  member of. A skipper: the reservations on their listings. Group threads are created lazily,
 *  so tripThreadId may be null (no messages yet) — same pattern as the 1-1 list. */
export async function listTripConversations(env: Env, user: SessionUser): Promise<TripConversation[]> {
  const reservationsQuery =
    user.role === "customer"
      ? `SELECT r.reservation_id AS reservationId, r.reservation_code AS reservationCode,
                r.trip_date AS tripDate, r.skipper_id AS skipperId
           FROM reservation_members m
           JOIN reservations r ON r.reservation_id = m.reservation_id
          WHERE m.customer_id = ?`
      : `SELECT r.reservation_id AS reservationId, r.reservation_code AS reservationCode,
                r.trip_date AS tripDate, r.skipper_id AS skipperId
           FROM reservations r
          WHERE r.skipper_id = ?`;

  const { results: reservations } = await env.DB.prepare(reservationsQuery)
    .bind(user.id)
    .all<{ reservationId: number; reservationCode: string; tripDate: string | null; skipperId: number }>();

  const out: TripConversation[] = [];
  for (const r of reservations ?? []) {
    // Only surface a TRIP/group thread once it actually has >1 member (i.e. someone invited
    // their party) — a solo reservation stays in the 1-1 list to avoid duplicate rows.
    const memberCount = await env.DB.prepare(
      `SELECT count(*) AS n FROM reservation_members WHERE reservation_id = ?`
    )
      .bind(r.reservationId)
      .first<{ n: number }>();
    if ((memberCount?.n ?? 0) < 2) continue;

    const thread = await env.DB.prepare(
      `SELECT id, status, last_message_at AS lastMessageAt, last_message_preview AS preview
         FROM trip_threads WHERE reservation_id = ?`
    )
      .bind(r.reservationId)
      .first<{ id: number; status: string; lastMessageAt: string | null; preview: string | null }>();

    // Participant names: the member customers + the skipper/boat name.
    const { results: memberRows } = await env.DB.prepare(
      `SELECT COALESCE(c.name, '') AS name
         FROM reservation_members m
         JOIN customers c ON c.customer_id = m.customer_id
        WHERE m.reservation_id = ?
        ORDER BY m.role = 'lead' DESC, m.joined_at`
    )
      .bind(r.reservationId)
      .all<{ name: string }>();
    const skipper = await env.DB.prepare(
      `SELECT COALESCE(listing_title, boat_name, name) AS name FROM skippers WHERE skipper_id = ?`
    )
      .bind(r.skipperId)
      .first<{ name: string | null }>();

    const participantNames = [
      ...(memberRows ?? []).map((m) => m.name).filter(Boolean),
      skipper?.name ?? "Skipper",
    ];

    let unread = 0;
    if (thread) {
      const u = await env.DB.prepare(
        `SELECT count(*) AS n FROM messages msg
          WHERE msg.trip_thread_id = ? AND msg.deleted_at IS NULL
            AND NOT (msg.sender_party_id = ? AND msg.sender_role = ?)
            AND msg.id > COALESCE(
              (SELECT last_read_message_id FROM read_state
                WHERE thread_id = ? AND reader_party_id = ?), 0)`
      )
        // read_state is keyed by thread_id; for group threads we namespace the reader's
        // read-cursor under the NEGATIVE trip_thread_id so it never collides with a 1-1 thread id.
        .bind(thread.id, user.id, user.role, -thread.id, user.id)
        .first<{ n: number }>();
      unread = Number(u?.n ?? 0);
    }

    out.push({
      tripThreadId: thread?.id ?? null,
      reservationId: r.reservationId,
      reservationCode: r.reservationCode,
      tripDate: r.tripDate,
      status: thread?.status ?? "active",
      lastMessageAt: thread?.lastMessageAt ?? null,
      preview: thread?.preview ?? null,
      unread,
      participantCount: (memberRows?.length ?? 0) + 1,
      participantNames,
    });
  }

  out.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) return a.lastMessageAt < b.lastMessageAt ? 1 : -1;
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return (a.tripDate ?? "") < (b.tripDate ?? "") ? 1 : -1;
  });
  return out;
}

/** Open (or lazily create) the group thread for a reservation the user belongs to. */
export async function openTripThread(
  env: Env,
  user: SessionUser,
  reservationId: number
): Promise<{ id: number } | null> {
  if (!(await isGroupParticipant(env, user, reservationId))) return null;
  const id = await ensureTripThread(env, reservationId);
  return { id };
}

/** Confirm the user is a participant of a group thread (authorization for message access). */
async function tripParticipant(
  env: Env,
  user: SessionUser,
  tripThreadId: number
): Promise<{ id: number; status: string; reservationId: number } | null> {
  const t = await env.DB.prepare(
    `SELECT id, status, reservation_id AS reservationId FROM trip_threads WHERE id = ?`
  )
    .bind(tripThreadId)
    .first<{ id: number; status: string; reservationId: number }>();
  if (!t) return null;
  return (await isGroupParticipant(env, user, t.reservationId)) ? t : null;
}

export async function getTripMessages(
  env: Env,
  user: SessionUser,
  tripThreadId: number,
  since: number
) {
  const t = await tripParticipant(env, user, tripThreadId);
  if (!t) return null;

  const { results } = await env.DB.prepare(
    `SELECT id, sender_party_id AS senderId, sender_role AS senderRole, body,
            created_at AS createdAt, edited_at AS editedAt
       FROM messages
      WHERE trip_thread_id = ? AND deleted_at IS NULL AND id > ?
      ORDER BY id`
  )
    .bind(tripThreadId, since)
    .all<{ id: number }>();

  const maxId = (results ?? []).reduce((m: number, r: any) => Math.max(m, r.id), since);
  if (maxId > since) await markTripRead(env, user, tripThreadId, maxId);
  return results ?? [];
}

export async function postTripMessage(
  env: Env,
  user: SessionUser,
  tripThreadId: number,
  rawBody: string
): Promise<{ id: number } | null | "locked"> {
  const t = await tripParticipant(env, user, tripThreadId);
  if (!t) return null;
  if (t.status !== "active") return "locked";

  const body = rawBody.trim().slice(0, MAX_BODY);
  if (!body) return null;
  const preview = body.slice(0, 100);

  const inserted = await env.DB.prepare(
    `INSERT INTO messages (trip_thread_id, sender_party_id, sender_role, body)
     VALUES (?, ?, ?, ?) RETURNING id`
  )
    .bind(tripThreadId, user.id, user.role, body)
    .first<{ id: number }>();

  await env.DB.prepare(
    `UPDATE trip_threads SET last_message_at = datetime('now'), last_message_preview = ? WHERE id = ?`
  )
    .bind(preview, tripThreadId)
    .run();

  if (inserted) await markTripRead(env, user, tripThreadId, inserted.id);
  return inserted;
}

/** Group read-state. Reuses the read_state table but namespaces the thread under the NEGATIVE
 *  trip_thread_id, so a group thread's cursor never collides with a 1-1 thread of the same id. */
export async function markTripRead(
  env: Env,
  user: SessionUser,
  tripThreadId: number,
  lastMessageId: number
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO read_state (thread_id, reader_party_id, last_read_message_id, last_read_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(thread_id, reader_party_id) DO UPDATE SET
       last_read_message_id = max(last_read_message_id, excluded.last_read_message_id),
       last_read_at = excluded.last_read_at`
  )
    .bind(-tripThreadId, user.id, lastMessageId)
    .run();
}

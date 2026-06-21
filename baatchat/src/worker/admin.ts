// Admin (Kristian) management. Lists claimed chat accounts and the full directory of
// skippers/customers, lets the admin approve/revoke chat access + mark an email verified,
// and gives read-only oversight of every conversation. Guarded by an admin JWT or the
// ADMIN_SYNC_KEY in the route layer.

import type { Env } from "./index";

export interface AdminAccount {
  id: number;
  partyId: number;
  email: string;
  role: string; // 'skipper' | 'customer'
  name: string | null;
  emailVerified: boolean;
  status: string; // 'pending' | 'active' | 'suspended'
  createdAt: string;
  lastLoginAt: string | null;
}

// --- full directory (all skippers/customers + onboarding status) -------------
// Registration status comes from a LEFT JOIN to chat_accounts (party_id + role), so
// rows that haven't onboarded show registered=false / status=null.

export interface DirectorySkipper {
  id: number; // skipper_id
  accountId: number | null;
  name: string | null;
  boatName: string | null;
  serviceType: string;
  location: string | null;
  email: string | null;
  reservationCount: number;
  registered: boolean;
  status: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export interface DirectoryCustomer {
  id: number; // customer_id
  accountId: number | null;
  name: string | null;
  email: string | null;
  reservationCount: number;
  registered: boolean;
  status: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export async function listSkipperDirectory(env: Env): Promise<DirectorySkipper[]> {
  const { results } = await env.DB.prepare(
    `SELECT s.skipper_id AS id, s.name, s.boat_name AS boatName, s.service_type AS serviceType,
            s.location, s.email,
            (SELECT count(*) FROM reservations WHERE skipper_id = s.skipper_id) AS reservationCount,
            ca.id AS accountId, ca.status AS status, ca.email_verified AS ev, ca.last_login_at AS lastLoginAt
       FROM skippers s
       LEFT JOIN chat_accounts ca ON ca.party_id = s.skipper_id AND ca.role = 'skipper'
      ORDER BY COALESCE(s.listing_title, s.boat_name, s.name)`
  ).all<any>();
  return (results ?? []).map((r) => ({
    id: r.id,
    accountId: r.accountId ?? null,
    name: r.name,
    boatName: r.boatName,
    serviceType: r.serviceType,
    location: r.location,
    email: r.email,
    reservationCount: Number(r.reservationCount ?? 0),
    registered: r.status != null,
    status: r.status ?? null,
    emailVerified: !!r.ev,
    lastLoginAt: r.lastLoginAt ?? null,
  }));
}

export async function listCustomerDirectory(
  env: Env,
  opts: { search?: string; limit: number; offset: number }
): Promise<{ customers: DirectoryCustomer[]; total: number }> {
  const term = (opts.search ?? "").trim().toLowerCase();
  const like = `%${term}%`;
  const where = term ? `WHERE (lower(c.name) LIKE ? OR lower(c.email) LIKE ?)` : ``;

  const countStmt = term
    ? env.DB.prepare(`SELECT count(*) AS n FROM customers c ${where}`).bind(like, like)
    : env.DB.prepare(`SELECT count(*) AS n FROM customers c ${where}`);
  const totalRow = await countStmt.first<{ n: number }>();

  const sql = `SELECT c.customer_id AS id, c.name, c.email,
            (SELECT count(*) FROM reservations WHERE customer_id = c.customer_id) AS reservationCount,
            ca.id AS accountId, ca.status AS status, ca.email_verified AS ev, ca.last_login_at AS lastLoginAt
       FROM customers c
       LEFT JOIN chat_accounts ca ON ca.party_id = c.customer_id AND ca.role = 'customer'
       ${where}
      ORDER BY (CASE ca.status WHEN 'pending' THEN 0 WHEN 'active' THEN 1
                               WHEN 'suspended' THEN 2 ELSE 3 END), c.name
      LIMIT ? OFFSET ?`;
  const pageStmt = term
    ? env.DB.prepare(sql).bind(like, like, opts.limit, opts.offset)
    : env.DB.prepare(sql).bind(opts.limit, opts.offset);
  const { results } = await pageStmt.all<any>();

  return {
    total: Number(totalRow?.n ?? 0),
    customers: (results ?? []).map((r) => ({
      id: r.id,
      accountId: r.accountId ?? null,
      name: r.name,
      email: r.email,
      reservationCount: Number(r.reservationCount ?? 0),
      registered: r.status != null,
      status: r.status ?? null,
      emailVerified: !!r.ev,
      lastLoginAt: r.lastLoginAt ?? null,
    })),
  };
}

// --- conversation oversight (admin, read-only) ------------------------------

export interface AdminThread {
  id: number;
  skipperId: number;
  skipperName: string | null;
  customerId: number;
  customerName: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  messageCount: number;
}

export interface AdminMessage {
  id: number;
  senderId: number;
  senderRole: string; // 'skipper' | 'customer'
  body: string;
  createdAt: string;
  editedAt: string | null;
}

const THREAD_SELECT = `SELECT t.id, t.skipper_id AS skipperId,
            COALESCE(s.listing_title, s.boat_name, s.name) AS skipperName,
            t.customer_id AS customerId, c.name AS customerName,
            t.status, t.last_message_at AS lastMessageAt, t.last_message_preview AS preview,
            (SELECT count(*) FROM messages m WHERE m.thread_id = t.id AND m.deleted_at IS NULL)
              AS messageCount`;
const THREAD_JOINS = `FROM threads t
       LEFT JOIN skippers s ON s.skipper_id = t.skipper_id
       LEFT JOIN customers c ON c.customer_id = t.customer_id`;

function mapThread(r: any): AdminThread {
  return {
    id: r.id,
    skipperId: r.skipperId,
    skipperName: r.skipperName ?? null,
    customerId: r.customerId,
    customerName: r.customerName ?? null,
    status: r.status,
    lastMessageAt: r.lastMessageAt ?? null,
    preview: r.preview ?? null,
    messageCount: Number(r.messageCount ?? 0),
  };
}

export async function listAllThreads(
  env: Env,
  opts: { search?: string; limit: number; offset: number }
): Promise<{ threads: AdminThread[]; total: number }> {
  const term = (opts.search ?? "").trim().toLowerCase();
  const like = `%${term}%`;
  const where = term
    ? `WHERE lower(COALESCE(s.listing_title, s.boat_name, s.name)) LIKE ? OR lower(c.name) LIKE ?`
    : ``;

  const countSql = `SELECT count(*) AS n ${THREAD_JOINS} ${where}`;
  const countStmt = term ? env.DB.prepare(countSql).bind(like, like) : env.DB.prepare(countSql);
  const totalRow = await countStmt.first<{ n: number }>();

  const sql = `${THREAD_SELECT} ${THREAD_JOINS} ${where}
      ORDER BY t.last_message_at DESC NULLS LAST, t.id DESC
      LIMIT ? OFFSET ?`;
  const stmt = term
    ? env.DB.prepare(sql).bind(like, like, opts.limit, opts.offset)
    : env.DB.prepare(sql).bind(opts.limit, opts.offset);
  const { results } = await stmt.all<any>();

  return { total: Number(totalRow?.n ?? 0), threads: (results ?? []).map(mapThread) };
}

export async function adminThreadMessages(
  env: Env,
  threadId: number
): Promise<{ thread: AdminThread; messages: AdminMessage[] } | null> {
  const row = await env.DB.prepare(`${THREAD_SELECT} ${THREAD_JOINS} WHERE t.id = ?`)
    .bind(threadId)
    .first<any>();
  if (!row) return null;

  const { results } = await env.DB.prepare(
    `SELECT id, sender_party_id AS senderId, sender_role AS senderRole, body,
            created_at AS createdAt, edited_at AS editedAt
       FROM messages
      WHERE thread_id = ? AND deleted_at IS NULL
      ORDER BY id`
  )
    .bind(threadId)
    .all<AdminMessage>();
  return { thread: mapThread(row), messages: results ?? [] };
}

export async function listAccounts(env: Env): Promise<AdminAccount[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, party_id AS partyId, email, role, display_name AS name,
            email_verified AS ev, status, created_at AS createdAt, last_login_at AS lastLoginAt
       FROM chat_accounts
      ORDER BY (status = 'pending') DESC, created_at DESC`
  ).all<Omit<AdminAccount, "emailVerified"> & { ev: number }>();
  return (results ?? []).map(({ ev, ...r }) => ({ ...r, emailVerified: !!ev }));
}

export async function approveAccount(env: Env, id: number): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE chat_accounts SET status = 'active' WHERE id = ?`)
    .bind(id)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function revokeAccount(env: Env, id: number): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE chat_accounts SET status = 'suspended' WHERE id = ?`)
    .bind(id)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

/** Admin override of a skipper's on-file email (so the onboarding code can reach them). */
export async function setSkipperEmail(env: Env, skipperId: number, email: string): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE skippers SET email = ? WHERE skipper_id = ?`)
    .bind(email.trim().toLowerCase(), skipperId)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

/** Admin override of a customer's on-file email (same purpose). */
export async function setCustomerEmail(env: Env, customerId: number, email: string): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE customers SET email = ? WHERE customer_id = ?`)
    .bind(email.trim().toLowerCase(), customerId)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function setEmailVerified(env: Env, id: number, verified: boolean): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE chat_accounts SET email_verified = ? WHERE id = ?`)
    .bind(verified ? 1 : 0, id)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

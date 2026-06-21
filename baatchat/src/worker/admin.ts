// Admin user management (Phase 2/4). Lists claimed chat accounts and lets an admin
// mark an email verified and approve (or revoke) chat access. Guarded by an admin JWT
// or the ADMIN_SYNC_KEY in the route layer. No "level" concept — just role + approval.

import type { Env } from "./index";

export interface AdminAccount {
  id: number;
  oblinorId: number;
  email: string;
  role: string;
  name: string | null;
  emailVerified: boolean;
  status: string; // 'pending' | 'active' | 'suspended'
  createdAt: string;
  lastLoginAt: string | null;
}

// --- full directory (all synced loaners/investors + registration status) ----
// Admin-only browse of everyone in Oblinor's data, whether or not they've claimed a
// chat account yet. Registration status comes from a LEFT JOIN to chat_accounts
// (oblinor_id + role), so unregistered rows show registered=false / status=null.

export interface DirectoryLoaner {
  id: number; // loaner_id
  accountId: number | null; // chat_accounts.id, if registered (for approve/revoke)
  orgNumber: string | null;
  name: string | null; // company_name
  contactPerson: string | null;
  email: string | null;
  loanCount: number;
  registered: boolean;
  status: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export interface DirectoryInvestor {
  id: number; // user_id
  accountId: number | null; // chat_accounts.id, if registered (for approve/revoke)
  name: string | null;
  email: string | null;
  orderCount: number;
  registered: boolean;
  status: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export async function listLoanerDirectory(env: Env): Promise<DirectoryLoaner[]> {
  const { results } = await env.DB.prepare(
    `SELECT ln.loaner_id AS id, ln.org_number AS orgNumber, ln.company_name AS name,
            ln.contact_person AS contactPerson, ln.email,
            (SELECT count(*) FROM loans WHERE loaner_id = ln.loaner_id) AS loanCount,
            ca.id AS accountId, ca.status AS status, ca.email_verified AS ev, ca.last_login_at AS lastLoginAt
       FROM loaners ln
       LEFT JOIN chat_accounts ca ON ca.oblinor_id = ln.loaner_id AND ca.role = 'loaner'
      ORDER BY ln.company_name`
  ).all<any>();
  return (results ?? []).map((r) => ({
    id: r.id,
    accountId: r.accountId ?? null,
    orgNumber: r.orgNumber,
    name: r.name,
    contactPerson: r.contactPerson,
    email: r.email,
    loanCount: Number(r.loanCount ?? 0),
    registered: r.status != null,
    status: r.status ?? null,
    emailVerified: !!r.ev,
    lastLoginAt: r.lastLoginAt ?? null,
  }));
}

export async function listInvestorDirectory(
  env: Env,
  opts: { search?: string; limit: number; offset: number }
): Promise<{ investors: DirectoryInvestor[]; total: number }> {
  const term = (opts.search ?? "").trim().toLowerCase();
  const like = `%${term}%`;
  // Only investors who actually invested (hold at least one order). Optionally narrowed
  // by the search term.
  const hasOrders = `EXISTS (SELECT 1 FROM orders o WHERE o.user_id = iv.user_id)`;
  const where = term
    ? `WHERE ${hasOrders} AND (lower(iv.name) LIKE ? OR lower(iv.email) LIKE ?)`
    : `WHERE ${hasOrders}`;

  const countStmt = term
    ? env.DB.prepare(`SELECT count(*) AS n FROM investors iv ${where}`).bind(like, like)
    : env.DB.prepare(`SELECT count(*) AS n FROM investors iv ${where}`);
  const totalRow = await countStmt.first<{ n: number }>();

  const sql = `SELECT iv.user_id AS id, iv.name, iv.email,
            (SELECT count(*) FROM orders WHERE user_id = iv.user_id) AS orderCount,
            ca.id AS accountId, ca.status AS status, ca.email_verified AS ev, ca.last_login_at AS lastLoginAt
       FROM investors iv
       LEFT JOIN chat_accounts ca ON ca.oblinor_id = iv.user_id AND ca.role = 'investor'
       ${where}
      ORDER BY (CASE ca.status WHEN 'pending' THEN 0 WHEN 'active' THEN 1
                               WHEN 'suspended' THEN 2 ELSE 3 END), iv.name
      LIMIT ? OFFSET ?`;
  const pageStmt = term
    ? env.DB.prepare(sql).bind(like, like, opts.limit, opts.offset)
    : env.DB.prepare(sql).bind(opts.limit, opts.offset);
  const { results } = await pageStmt.all<any>();

  return {
    total: Number(totalRow?.n ?? 0),
    investors: (results ?? []).map((r) => ({
      id: r.id,
      accountId: r.accountId ?? null,
      name: r.name,
      email: r.email,
      orderCount: Number(r.orderCount ?? 0),
      registered: r.status != null,
      status: r.status ?? null,
      emailVerified: !!r.ev,
      lastLoginAt: r.lastLoginAt ?? null,
    })),
  };
}

// --- conversation oversight (admin, read-only) ------------------------------
// Admins aren't chat participants, so the /chat routes are closed to them. These give a
// read-only window into every thread + its messages for moderation/support.

export interface AdminThread {
  id: number;
  loanerId: number;
  loanerName: string | null;
  investorId: number;
  investorName: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  messageCount: number;
}

export interface AdminMessage {
  id: number;
  senderId: number;
  senderRole: string; // 'investor' | 'loaner'
  body: string;
  createdAt: string;
  editedAt: string | null;
}

export async function listAllThreads(
  env: Env,
  opts: { search?: string; limit: number; offset: number }
): Promise<{ threads: AdminThread[]; total: number }> {
  const term = (opts.search ?? "").trim().toLowerCase();
  const like = `%${term}%`;
  const joins = `FROM threads t
       LEFT JOIN loaners ln ON ln.loaner_id = t.loaner_id
       LEFT JOIN investors iv ON iv.user_id = t.investor_id`;
  const where = term ? `WHERE lower(ln.company_name) LIKE ? OR lower(iv.name) LIKE ?` : ``;

  const countSql = `SELECT count(*) AS n ${joins} ${where}`;
  const countStmt = term ? env.DB.prepare(countSql).bind(like, like) : env.DB.prepare(countSql);
  const totalRow = await countStmt.first<{ n: number }>();

  const sql = `SELECT t.id, t.loaner_id AS loanerId, ln.company_name AS loanerName,
            t.investor_id AS investorId, iv.name AS investorName,
            t.status, t.last_message_at AS lastMessageAt, t.last_message_preview AS preview,
            (SELECT count(*) FROM messages m WHERE m.thread_id = t.id AND m.deleted_at IS NULL)
              AS messageCount
       ${joins} ${where}
      ORDER BY t.last_message_at DESC NULLS LAST, t.id DESC
      LIMIT ? OFFSET ?`;
  const stmt = term
    ? env.DB.prepare(sql).bind(like, like, opts.limit, opts.offset)
    : env.DB.prepare(sql).bind(opts.limit, opts.offset);
  const { results } = await stmt.all<any>();

  return {
    total: Number(totalRow?.n ?? 0),
    threads: (results ?? []).map((r) => ({
      id: r.id,
      loanerId: r.loanerId,
      loanerName: r.loanerName ?? null,
      investorId: r.investorId,
      investorName: r.investorName ?? null,
      status: r.status,
      lastMessageAt: r.lastMessageAt ?? null,
      preview: r.preview ?? null,
      messageCount: Number(r.messageCount ?? 0),
    })),
  };
}

export async function adminThreadMessages(
  env: Env,
  threadId: number
): Promise<{ thread: AdminThread; messages: AdminMessage[] } | null> {
  const row = await env.DB.prepare(
    `SELECT t.id, t.loaner_id AS loanerId, ln.company_name AS loanerName,
            t.investor_id AS investorId, iv.name AS investorName,
            t.status, t.last_message_at AS lastMessageAt, t.last_message_preview AS preview,
            (SELECT count(*) FROM messages m WHERE m.thread_id = t.id AND m.deleted_at IS NULL)
              AS messageCount
       FROM threads t
       LEFT JOIN loaners ln ON ln.loaner_id = t.loaner_id
       LEFT JOIN investors iv ON iv.user_id = t.investor_id
      WHERE t.id = ?`
  )
    .bind(threadId)
    .first<any>();
  if (!row) return null;
  const thread: AdminThread = {
    id: row.id,
    loanerId: row.loanerId,
    loanerName: row.loanerName ?? null,
    investorId: row.investorId,
    investorName: row.investorName ?? null,
    status: row.status,
    lastMessageAt: row.lastMessageAt ?? null,
    preview: row.preview ?? null,
    messageCount: Number(row.messageCount ?? 0),
  };

  const { results } = await env.DB.prepare(
    `SELECT id, sender_oblinor_id AS senderId, sender_role AS senderRole, body,
            created_at AS createdAt, edited_at AS editedAt
       FROM messages
      WHERE thread_id = ? AND deleted_at IS NULL
      ORDER BY id`
  )
    .bind(threadId)
    .all<AdminMessage>();
  return { thread, messages: results ?? [] };
}

export async function listAccounts(env: Env): Promise<AdminAccount[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, oblinor_id AS oblinorId, email, role, display_name AS name,
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

/** Admin override of a loaner's on-file email — for borrowers Oblinor has no email for,
 *  so they can register (the OTP code goes to this address). A future oblinor.no sync
 *  may overwrite it; the real fix is to add the email at the source. */
export async function setLoanerEmail(env: Env, loanerId: number, email: string): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE loaners SET email = ? WHERE loaner_id = ?`)
    .bind(email.trim().toLowerCase(), loanerId)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

/** Admin override of an investor's on-file email (same purpose as setLoanerEmail). */
export async function setInvestorEmail(env: Env, userId: number, email: string): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE investors SET email = ? WHERE user_id = ?`)
    .bind(email.trim().toLowerCase(), userId)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function setEmailVerified(env: Env, id: number, verified: boolean): Promise<boolean> {
  const r = await env.DB.prepare(`UPDATE chat_accounts SET email_verified = ? WHERE id = ?`)
    .bind(verified ? 1 : 0, id)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

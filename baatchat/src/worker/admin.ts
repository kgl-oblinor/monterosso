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

// --- skipper listing CRUD (the form Kristian uses to add/edit a listing) -----
// A full skipper record (the editable listing fields). `slots` is a JSON array of
// departure times; `base_price` is in minor units (cents); `active` is 0/1.

export interface Skipper {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  country: string | null;
  boat_name: string | null;
  service_type: string;
  slots: string[];
  base_price: number | null;
  currency: string;
  payment_ref: string | null;
  active: boolean;
  created: string;
}

// Editable fields accepted from the admin form. All optional on PUT; create requires name.
export interface SkipperInput {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  location?: string | null;
  country?: string | null;
  boat_name?: string | null;
  service_type?: string;
  slots?: unknown; // array of strings, or a JSON/CSV string — normalized below
  base_price?: number | null;
  currency?: string;
  payment_ref?: string | null;
  active?: boolean;
}

const SERVICE_TYPES = ["charter", "taxi", "freight"] as const;

// Normalize slots into a JSON-array string of trimmed time strings (or null).
function normalizeSlots(raw: unknown): string | null {
  let arr: string[] | null = null;
  if (Array.isArray(raw)) arr = raw.map((s) => String(s).trim()).filter(Boolean);
  else if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) arr = [];
    else if (t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) arr = parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch {
        arr = null;
      }
    } else {
      arr = t.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return arr ? JSON.stringify(arr) : null;
}

function parseSlots(stored: string | null): string[] {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map((s) => String(s)) : [];
  } catch {
    return [];
  }
}

function mapSkipper(r: any): Skipper {
  return {
    id: r.id,
    name: r.name ?? null,
    email: r.email ?? null,
    phone: r.phone ?? null,
    address: r.address ?? null,
    location: r.location ?? null,
    country: r.country ?? null,
    boat_name: r.boat_name ?? null,
    service_type: r.service_type ?? "charter",
    slots: parseSlots(r.slots ?? null),
    base_price: r.base_price ?? null,
    currency: r.currency ?? "EUR",
    payment_ref: r.payment_ref ?? null,
    active: !!r.active,
    created: r.created,
  };
}

const SKIPPER_SELECT = `SELECT skipper_id AS id, name, email, phone, address, location, country,
            boat_name, service_type, slots, base_price, currency, payment_ref, active,
            created_at AS created FROM skippers`;

export async function listSkippers(env: Env): Promise<Skipper[]> {
  const { results } = await env.DB.prepare(
    `${SKIPPER_SELECT} ORDER BY COALESCE(listing_title, boat_name, name)`
  ).all<any>();
  return (results ?? []).map(mapSkipper);
}

export async function getSkipper(env: Env, id: number): Promise<Skipper | null> {
  const row = await env.DB.prepare(`${SKIPPER_SELECT} WHERE skipper_id = ?`).bind(id).first<any>();
  return row ? mapSkipper(row) : null;
}

// Validate + normalize the form payload. Returns the cleaned input or an error message.
export function validateSkipperInput(
  input: SkipperInput,
  requireName: boolean
): { ok: true } | { ok: false; error: string } {
  if (requireName && !String(input.name ?? "").trim()) {
    return { ok: false, error: "Navn er påkrevd" };
  }
  if (input.service_type !== undefined && !SERVICE_TYPES.includes(input.service_type as any)) {
    return { ok: false, error: `service_type må være en av: ${SERVICE_TYPES.join(", ")}` };
  }
  if (input.email != null && input.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { ok: false, error: "Oppgi en gyldig e-postadresse" };
  }
  if (input.base_price != null && (!Number.isInteger(input.base_price) || input.base_price < 0)) {
    return { ok: false, error: "base_price må være et ikke-negativt heltall (cents)" };
  }
  return { ok: true };
}

export async function createSkipper(env: Env, input: SkipperInput): Promise<Skipper | null> {
  const row = await env.DB.prepare(
    `INSERT INTO skippers
       (name, email, phone, address, location, country, boat_name, service_type,
        slots, base_price, currency, payment_ref, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING skipper_id`
  )
    .bind(
      String(input.name ?? "").trim() || null,
      (input.email ?? "").trim().toLowerCase() || null,
      (input.phone ?? "")?.toString().trim() || null,
      (input.address ?? "")?.toString().trim() || null,
      (input.location ?? "")?.toString().trim() || null,
      (input.country ?? "")?.toString().trim() || null,
      (input.boat_name ?? "")?.toString().trim() || null,
      input.service_type ?? "charter",
      normalizeSlots(input.slots),
      input.base_price ?? null,
      (input.currency ?? "EUR").toString().trim().toUpperCase() || "EUR",
      (input.payment_ref ?? "")?.toString().trim() || null,
      input.active === false ? 0 : 1
    )
    .first<{ skipper_id: number }>();
  return row ? getSkipper(env, row.skipper_id) : null;
}

// Partial update — only the provided keys are written (COALESCE keeps the rest).
export async function updateSkipper(env: Env, id: number, input: SkipperInput): Promise<Skipper | null> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  const put = (col: string, val: unknown) => {
    sets.push(`${col} = ?`);
    binds.push(val);
  };

  if (input.name !== undefined) put("name", String(input.name ?? "").trim() || null);
  if (input.email !== undefined) put("email", (input.email ?? "").trim().toLowerCase() || null);
  if (input.phone !== undefined) put("phone", (input.phone ?? "")?.toString().trim() || null);
  if (input.address !== undefined) put("address", (input.address ?? "")?.toString().trim() || null);
  if (input.location !== undefined) put("location", (input.location ?? "")?.toString().trim() || null);
  if (input.country !== undefined) put("country", (input.country ?? "")?.toString().trim() || null);
  if (input.boat_name !== undefined) put("boat_name", (input.boat_name ?? "")?.toString().trim() || null);
  if (input.service_type !== undefined) put("service_type", input.service_type);
  if (input.slots !== undefined) put("slots", normalizeSlots(input.slots));
  if (input.base_price !== undefined) put("base_price", input.base_price ?? null);
  if (input.currency !== undefined) put("currency", (input.currency ?? "EUR").toString().trim().toUpperCase() || "EUR");
  if (input.payment_ref !== undefined) put("payment_ref", (input.payment_ref ?? "")?.toString().trim() || null);
  if (input.active !== undefined) put("active", input.active ? 1 : 0);

  if (sets.length === 0) return getSkipper(env, id); // nothing to change

  binds.push(id);
  const r = await env.DB.prepare(`UPDATE skippers SET ${sets.join(", ")} WHERE skipper_id = ?`)
    .bind(...binds)
    .run();
  if ((r.meta?.changes ?? 0) === 0) return null;
  return getSkipper(env, id);
}

// --- customers + reservations (admin list views per the shared contract) -----

export interface AdminCustomer {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  created: string;
}

export async function listCustomers(env: Env): Promise<AdminCustomer[]> {
  const { results } = await env.DB.prepare(
    `SELECT customer_id AS id, name, email, phone, created_at AS created
       FROM customers ORDER BY name`
  ).all<AdminCustomer>();
  return results ?? [];
}

export interface AdminReservation {
  id: number;
  code: string;
  skipper_id: number;
  customer_id: number | null;
  trip_date: string | null;
  guests: number | null;
  status: string;
  created: string;
}

export async function listReservations(env: Env): Promise<AdminReservation[]> {
  const { results } = await env.DB.prepare(
    `SELECT reservation_id AS id, reservation_code AS code, skipper_id, customer_id,
            trip_date, guests, status, created_at AS created
       FROM reservations ORDER BY trip_date DESC, reservation_id DESC`
  ).all<AdminReservation>();
  return results ?? [];
}

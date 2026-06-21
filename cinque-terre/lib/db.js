// Monterosso · Cinque Terre — D1 query helpers (Lane D · Data/DB)
//
// Thin wrappers over the Cloudflare D1 binding `env.DB` for the chat + light
// accounts. Lanes A/B/C call these from their API routes. Each helper takes the
// D1 database handle as its first argument so callers stay in control of how
// they obtain it (e.g. getCloudflareContext().env.DB in a route handler).
//
// Schema lives in db/schema.sql. Reservation code format: MT-DDMMYY-<guests>.

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Create a light user account. At least one of email/phone must be provided.
 * Returns the created user row.
 *
 * @param {D1Database} db
 * @param {{ email?: string|null, phone?: string|null, name?: string|null }} input
 */
export async function createUser(db, { email = null, phone = null, name = null } = {}) {
  const e = email ? email.trim().toLowerCase() : null;
  const p = phone ? phone.trim() : null;
  if (!e && !p) throw new Error("createUser: email or phone is required");

  const id = crypto.randomUUID();
  const created = new Date().toISOString();

  await db
    .prepare(
      "INSERT INTO users (id, email, phone, email_verified, phone_verified, name, created) VALUES (?,?,?,0,0,?,?)"
    )
    .bind(id, e, p, name, created)
    .run();

  return { id, email: e, phone: p, email_verified: 0, phone_verified: 0, name, created };
}

/**
 * Find a user by id, email, or phone. Pass exactly one lookup key.
 * Returns the row or null.
 *
 * @param {D1Database} db
 * @param {{ id?: string, email?: string, phone?: string }} by
 */
export async function findUser(db, { id, email, phone } = {}) {
  let sql, value;
  if (id) {
    sql = "SELECT * FROM users WHERE id = ?";
    value = id;
  } else if (email) {
    sql = "SELECT * FROM users WHERE email = ?";
    value = email.trim().toLowerCase();
  } else if (phone) {
    sql = "SELECT * FROM users WHERE phone = ?";
    value = phone.trim();
  } else {
    throw new Error("findUser: provide id, email, or phone");
  }
  return (await db.prepare(sql).bind(value).first()) ?? null;
}

/**
 * Mark a user's email or phone as verified. `channel` is "email" or "phone".
 * Returns true if a row was updated.
 *
 * @param {D1Database} db
 * @param {string} userId
 * @param {"email"|"phone"} channel
 */
export async function markVerified(db, userId, channel) {
  const column =
    channel === "email" ? "email_verified" : channel === "phone" ? "phone_verified" : null;
  if (!column) throw new Error("markVerified: channel must be 'email' or 'phone'");

  const res = await db
    .prepare(`UPDATE users SET ${column} = 1 WHERE id = ?`)
    .bind(userId)
    .run();
  return (res?.meta?.changes ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Messages (chat threads, keyed by reservation code)
// ---------------------------------------------------------------------------

/**
 * Add a message to the thread for a reservation code.
 * Returns the created message row.
 *
 * @param {D1Database} db
 * @param {{ code: string, sender: "customer"|"captain"|"admin", body: string, userId?: string|null }} input
 */
export async function addMessage(db, { code, sender, body, userId = null }) {
  if (!code) throw new Error("addMessage: code is required");
  if (!["customer", "captain", "admin"].includes(sender)) {
    throw new Error("addMessage: sender must be customer | captain | admin");
  }
  const text = (body ?? "").toString().trim();
  if (!text) throw new Error("addMessage: body is required");

  const id = crypto.randomUUID();
  const created = new Date().toISOString();

  await db
    .prepare(
      "INSERT INTO messages (id, code, sender, user_id, body, created) VALUES (?,?,?,?,?,?)"
    )
    .bind(id, code, sender, userId, text, created)
    .run();

  return { id, code, sender, user_id: userId, body: text, created, read_at: null };
}

/**
 * List all messages in a thread, oldest first.
 *
 * @param {D1Database} db
 * @param {string} code  reservation code MT-DDMMYY-<guests>
 * @returns {Promise<Array>}
 */
export async function listMessages(db, code) {
  if (!code) throw new Error("listMessages: code is required");
  const { results } = await db
    .prepare("SELECT * FROM messages WHERE code = ? ORDER BY created ASC")
    .bind(code)
    .all();
  return results ?? [];
}

/**
 * List the distinct reservation codes that have messages, most-recently-active
 * first. Powers the admin/captain inbox (Lane C).
 *
 * @param {D1Database} db
 * @returns {Promise<Array<{ code: string, last_at: string, count: number }>>}
 */
export async function listThreads(db) {
  const { results } = await db
    .prepare(
      "SELECT code, MAX(created) AS last_at, COUNT(*) AS count FROM messages GROUP BY code ORDER BY last_at DESC"
    )
    .all();
  return results ?? [];
}

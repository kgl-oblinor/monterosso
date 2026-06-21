// Phase 1 — pull-only sync from Oblinor (WordPress) into D1.
// Minimal slice only: investors, loaners, loans, orders (see migrations/0001_source.sql).
// Maps the reference backend's endpoints down to our columns. Loan project
// addresses are resolved separately (resolveAddresses) via Kartverket to stay
// under Workers' per-invocation subrequest limit.

import type { Env } from "./index";
import { createWpClient, type WpClient } from "./wp";
import { resolveAddress } from "./kartverket";

const PAGE_SIZE = 100;
const D1_BATCH = 50; // statements per D1 batch() call (1 subrequest each)

// --- API response shapes (only the fields we consume) ----------------------

interface UserItem {
  data: { id: number; displayName?: string; email?: string } | null;
  contact: { phone?: string; companyName?: string; orgnumber?: string } | null;
}
interface UsersResponse {
  total: number;
  hasMore: boolean;
  limit: number;
  users: UserItem[];
}

interface LoanItem {
  loan: {
    id: number;
    loanerId?: number | string;
    loanerOrgNumber?: string;
    mapaddress?: string;
    security_property?: any[];
    security_bail?: any[];
  };
  loaner: {
    name?: string;
    orgNumber?: string;
    contactId?: string;
    userId?: number | string; // the loaner's WP user-account id → email lives in `investors`
  } | null;
  summary: { amountTotal?: number } | null;
  orders?: any[];
}
interface LoansResponse {
  total: number;
  hasMore: boolean;
  limit: number;
  loans: LoanItem[];
}

// --- small coercion helpers -------------------------------------------------

const str = (v: any): string | null =>
  v == null || v === "" ? null : String(v);
const int = (v: any): number | null => {
  if (v == null || v === "") return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
};
const num = (v: any): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function runBatch(env: Env, stmts: D1PreparedStatement[]): Promise<void> {
  for (let i = 0; i < stmts.length; i += D1_BATCH) {
    await env.DB.batch(stmts.slice(i, i + D1_BATCH));
  }
}

async function markSynced(env: Env, source: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO sync_state (source, last_synced_at, last_error)
     VALUES (?, datetime('now'), NULL)
     ON CONFLICT(source) DO UPDATE SET last_synced_at = excluded.last_synced_at, last_error = NULL`
  )
    .bind(source)
    .run();
}

// --- investors (from allUserAllData) ----------------------------------------

export async function syncInvestors(
  env: Env,
  wp: WpClient
): Promise<{ count: number; userMap: Map<number, { name: string | null; email: string | null }> }> {
  const userMap = new Map<number, { name: string | null; email: string | null }>();
  let offset = 0;
  let count = 0;

  for (;;) {
    const page = await wp.get<UsersResponse>("/wp-json/oblinor/users/allUserAllData", {
      limit: PAGE_SIZE,
      offset,
    });
    const items = page.users ?? [];
    if (items.length === 0) break;

    const stmts: D1PreparedStatement[] = [];
    for (const it of items) {
      const u = it.data;
      if (!u?.id) continue;
      const name = str(u.displayName);
      const email = str(u.email);
      userMap.set(Number(u.id), { name, email });
      stmts.push(
        env.DB.prepare(
          `INSERT INTO investors (user_id, name, email, synced_at)
           VALUES (?, ?, ?, datetime('now'))
           ON CONFLICT(user_id) DO UPDATE SET
             name = excluded.name, email = excluded.email, synced_at = datetime('now')`
        ).bind(Number(u.id), name, email)
      );
    }
    await runBatch(env, stmts);
    count += stmts.length;

    if (!page.hasMore) break;
    offset += page.limit ?? items.length;
  }

  await markSynced(env, "users");
  return { count, userMap };
}

// --- loaners + loans + orders (from allLoansAllData) ------------------------

export async function syncLoans(
  env: Env,
  wp: WpClient,
  userMap: Map<number, { name: string | null; email: string | null }>
): Promise<{ loaners: number; loans: number; orders: number }> {
  let offset = 0;
  const loanerSeen = new Set<number>();
  let loanerCount = 0;
  let loanCount = 0;
  let orderCount = 0;

  for (;;) {
    const page = await wp.get<LoansResponse>(
      "/wp-json/oblinor/admin/v2/allLoansAllData",
      { limit: PAGE_SIZE, offset }
    );
    const items = page.loans ?? [];
    if (items.length === 0 && !page.hasMore) break;

    const stmts: D1PreparedStatement[] = [];
    for (const it of items) {
      const l = it.loan;
      if (!l?.id) continue;
      const loanerId = int(l.loanerId);

      // loaner (dedupe within run; upsert also dedupes across runs)
      if (loanerId != null && !loanerSeen.has(loanerId)) {
        loanerSeen.add(loanerId);
        const loanerUserId = int(it.loaner?.userId);
        const user = loanerUserId != null ? userMap.get(loanerUserId) : undefined;
        stmts.push(
          env.DB.prepare(
            `INSERT INTO loaners
               (loaner_id, org_number, company_name, contact_person, username, email, phone, address, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
             ON CONFLICT(loaner_id) DO UPDATE SET
               org_number = excluded.org_number, company_name = excluded.company_name,
               contact_person = excluded.contact_person, email = excluded.email,
               synced_at = datetime('now')`
          ).bind(
            loanerId,
            str(it.loaner?.orgNumber ?? l.loanerOrgNumber ?? it.loaner?.contactId),
            str(it.loaner?.name),
            user?.name ?? null,
            null,
            user?.email ?? null,
            null,
            null
          )
        );
        loanerCount++;
      }

      // loan — address left for the resolve pass; matrikkel from first property
      const prop = Array.isArray(l.security_property) ? l.security_property[0] : null;
      const bail = Array.isArray(l.security_bail)
        ? l.security_bail.map((b: any) => ({
            amount: num(b.amount),
            owner: str(b.owner),
            owner_name: str(b.owner_name),
          }))
        : [];
      stmts.push(
        env.DB.prepare(
          `INSERT INTO loans (loan_id, loaner_id, amount, security_bail, matrikkel, kommune, synced_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(loan_id) DO UPDATE SET
             loaner_id = excluded.loaner_id, amount = excluded.amount,
             security_bail = excluded.security_bail, matrikkel = excluded.matrikkel,
             kommune = excluded.kommune, synced_at = datetime('now')`
        ).bind(
          Number(l.id),
          loanerId ?? 0,
          num(it.summary?.amountTotal),
          bail.length ? JSON.stringify(bail) : null,
          str(prop?.gr_br),
          str(prop?.county)
        )
      );
      loanCount++;

      // orders for this loan
      for (const o of it.orders ?? []) {
        if (!o?.id) continue;
        stmts.push(
          env.DB.prepare(
            `INSERT INTO orders (id, loan_id, user_id, shares, amount, username, bank_in, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
             ON CONFLICT(id) DO UPDATE SET
               loan_id = excluded.loan_id, user_id = excluded.user_id, shares = excluded.shares,
               amount = excluded.amount, username = excluded.username, bank_in = excluded.bank_in,
               synced_at = datetime('now')`
          ).bind(
            Number(o.id),
            Number(l.id),
            int(o.userId),
            int(o.shares),
            num(o.amount),
            str(o.username),
            num(o.bankIn ?? o.bank_in)
          )
        );
        orderCount++;
      }
    }
    await runBatch(env, stmts);

    if (!page.hasMore) break;
    offset += page.limit ?? PAGE_SIZE;
  }

  await markSynced(env, "loans");
  return { loaners: loanerCount, loans: loanCount, orders: orderCount };
}

// --- chunked user sync (free-plan friendly) ---------------------------------
// Loads ALL users from allUserAllData one page per invocation (offset cursor),
// so we don't blow the subrequest cap. Caller loops until `done`.
export async function syncUsersPage(
  env: Env,
  offset: number,
  limit: number
): Promise<{ processed: number; total: number; nextOffset: number; done: boolean }> {
  const wp = createWpClient(env);
  const page = await wp.get<UsersResponse>("/wp-json/oblinor/users/allUserAllData", {
    limit,
    offset,
  });
  const items = page.users ?? [];

  const stmts: D1PreparedStatement[] = [];
  for (const it of items) {
    const u = it.data;
    if (!u?.id) continue;
    stmts.push(
      env.DB.prepare(
        `INSERT INTO investors (user_id, name, email, synced_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET
           name = excluded.name, email = excluded.email, synced_at = datetime('now')`
      ).bind(Number(u.id), str(u.displayName), str(u.email))
    );
  }
  await runBatch(env, stmts);
  if (offset === 0) await markSynced(env, "users");

  return {
    processed: items.length,
    total: page.total ?? 0,
    nextOffset: offset + (page.limit ?? limit),
    done: !page.hasMore || items.length === 0,
  };
}

// --- chunked loaner/loan sync (free-plan friendly) --------------------------
// Loaner emails already live in D1 (investors table, all users keyed by user_id),
// so we DON'T re-pull the users endpoint. We process loans one small page per
// invocation (offset cursor returned to the caller) to stay under the 50-subrequest
// free cap. Caller loops until `done`.

async function buildUserMapFromDb(
  env: Env
): Promise<Map<number, { name: string | null; email: string | null }>> {
  const { results } = await env.DB.prepare(
    `SELECT user_id, name, email FROM investors`
  ).all<{ user_id: number; name: string | null; email: string | null }>();
  const m = new Map<number, { name: string | null; email: string | null }>();
  for (const r of results ?? []) m.set(Number(r.user_id), { name: r.name, email: r.email });
  return m;
}

export async function syncLoansPage(
  env: Env,
  offset: number,
  limit: number
): Promise<{
  processed: number;
  loaners: number;
  loans: number;
  orders: number;
  nextOffset: number;
  done: boolean;
}> {
  const wp = createWpClient(env);
  const userMap = await buildUserMapFromDb(env);

  const page = await wp.get<LoansResponse>(
    "/wp-json/oblinor/admin/v2/allLoansAllData",
    { limit, offset }
  );
  const items = page.loans ?? [];

  const loanerSeen = new Set<number>();
  let loanerCount = 0;
  let loanCount = 0;
  let orderCount = 0;
  const stmts: D1PreparedStatement[] = [];

  for (const it of items) {
    const l = it.loan;
    if (!l?.id) continue;
    const loanerId = int(l.loanerId);

    if (loanerId != null && !loanerSeen.has(loanerId)) {
      loanerSeen.add(loanerId);
      // The loaner's email lives on its linked WP user account (loaner.userId),
      // which we've already synced into `investors` — NOT keyed by loanerId (a post id).
      const loanerUserId = int(it.loaner?.userId);
      const user = loanerUserId != null ? userMap.get(loanerUserId) : undefined;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO loaners
             (loaner_id, org_number, company_name, contact_person, username, email, phone, address, synced_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(loaner_id) DO UPDATE SET
             org_number = excluded.org_number, company_name = excluded.company_name,
             contact_person = excluded.contact_person, email = excluded.email,
             synced_at = datetime('now')`
        ).bind(
          loanerId,
          str(it.loaner?.orgNumber ?? l.loanerOrgNumber ?? it.loaner?.contactId),
          str(it.loaner?.name),
          user?.name ?? null,
          null,
          user?.email ?? null,
          null,
          null
        )
      );
      loanerCount++;
    }

    const prop = Array.isArray(l.security_property) ? l.security_property[0] : null;
    const bail = Array.isArray(l.security_bail)
      ? l.security_bail.map((b: any) => ({
          amount: num(b.amount),
          owner: str(b.owner),
          owner_name: str(b.owner_name),
        }))
      : [];
    stmts.push(
      env.DB.prepare(
        `INSERT INTO loans (loan_id, loaner_id, amount, security_bail, matrikkel, kommune, address, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(loan_id) DO UPDATE SET
           loaner_id = excluded.loaner_id, amount = excluded.amount,
           security_bail = excluded.security_bail, matrikkel = excluded.matrikkel,
           kommune = excluded.kommune, address = excluded.address, synced_at = datetime('now')`
      ).bind(
        Number(l.id),
        loanerId ?? 0,
        num(it.summary?.amountTotal),
        bail.length ? JSON.stringify(bail) : null,
        str(prop?.gr_br),
        str(prop?.county),
        str(l.mapaddress) // primary property address (clean street+postal+city)
      )
    );
    loanCount++;

    for (const o of it.orders ?? []) {
      if (!o?.id) continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO orders (id, loan_id, user_id, shares, amount, username, bank_in, synced_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             loan_id = excluded.loan_id, user_id = excluded.user_id, shares = excluded.shares,
             amount = excluded.amount, username = excluded.username, bank_in = excluded.bank_in,
             synced_at = datetime('now')`
        ).bind(
          Number(o.id),
          Number(l.id),
          int(o.userId),
          int(o.shares),
          num(o.amount),
          str(o.username),
          num(o.bankIn ?? o.bank_in)
        )
      );
      orderCount++;
    }
  }

  await runBatch(env, stmts);
  await markSynced(env, "loans");

  return {
    processed: items.length,
    loaners: loanerCount,
    loans: loanCount,
    orders: orderCount,
    nextOffset: offset + (page.limit ?? limit),
    done: !page.hasMore || items.length === 0,
  };
}

// --- bounded address resolution (Kartverket) --------------------------------

export async function resolveAddresses(
  env: Env,
  limit: number
): Promise<{ resolved: number; failed: number; remaining: number }> {
  const { results } = await env.DB.prepare(
    `SELECT loan_id, matrikkel, kommune FROM loans
      WHERE address_verified IS NULL AND matrikkel IS NOT NULL
      LIMIT ?`
  )
    .bind(limit)
    .all<{ loan_id: number; matrikkel: string; kommune: string | null }>();

  let resolved = 0;
  let failed = 0;
  for (const row of results ?? []) {
    try {
      const address = await resolveAddress(row.matrikkel, row.kommune);
      if (address) {
        await env.DB.prepare(`UPDATE loans SET address_verified = ? WHERE loan_id = ?`)
          .bind(address, row.loan_id)
          .run();
        resolved++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  const remainingRow = await env.DB.prepare(
    `SELECT count(*) AS n FROM loans WHERE address_verified IS NULL AND matrikkel IS NOT NULL`
  ).first<{ n: number }>();

  if (resolved > 0) await markSynced(env, "addresses");
  return { resolved, failed, remaining: remainingRow?.n ?? 0 };
}

// --- orchestrator -----------------------------------------------------------

export async function runSyncData(env: Env) {
  const wp = createWpClient(env);
  const investors = await syncInvestors(env, wp);
  const loans = await syncLoans(env, wp, investors.userMap);
  return { investors: investors.count, ...loans };
}

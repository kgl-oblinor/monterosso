// Public booking intake — the ONE call behind the landing's "Check availability".
//
// Unauthenticated by design (frictionless): a visitor who finishes the booking wizard gets,
// in a single request, (a) an INSTANT customer account (no verification/approval) and (b) a
// RESERVATION with status 'requested' assigned to the pilot skipper (skipper_id = 1), so the
// request lands in that skipper's dashboard. It reuses the same customers / chat_accounts /
// reservations tables the rest of the app owns.

import type { Env } from "./index";

// The pilot skipper every landing request is routed to (Andrea). Already seeded in the DB.
const PILOT_SKIPPER_ID = 1;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (e: string) => e.trim().toLowerCase();

export interface BookingInput {
  tour?: string;
  date?: string;
  time?: string;
  guests?: number | string;
  email?: string;
  name?: string;
}

export type BookingResult =
  | { ok: true; code: string; reservationId: number }
  | { ok: false; error: string };

// reservation_code — the existing format is "<prefix>-DDMMYY-<guests>" (e.g. "MT-210625-2"),
// prefix taken from the skipper's listing. A short random suffix is appended only if the base
// code is already taken, to satisfy the reservation_code UNIQUE constraint.
function ddmmyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}${m}${y.slice(2)}`;
}

async function uniqueCode(env: Env, prefix: string, iso: string, guests: number): Promise<string> {
  const base = `${prefix}-${ddmmyy(iso)}-${guests}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const clash = await env.DB.prepare(
      `SELECT 1 FROM reservations WHERE reservation_code = ? LIMIT 1`
    )
      .bind(code)
      .first();
    if (!clash) return code;
  }
  // Extremely unlikely fallthrough — timestamp suffix guarantees uniqueness.
  return `${base}-${Date.now().toString(36).toUpperCase()}`;
}

export async function createPublicBooking(env: Env, input: BookingInput): Promise<BookingResult> {
  const email = input.email ? normEmail(input.email) : "";
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "En gyldig e-post er påkrevd" };

  const guests = Math.floor(Number(input.guests));
  if (!Number.isFinite(guests) || guests < 1 || guests > 12) {
    return { ok: false, error: "Antall gjester må være mellom 1 og 12" };
  }

  const date = (input.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "En gyldig dato (YYYY-MM-DD) er påkrevd" };

  const name = input.name?.trim() || null;

  // 1) Upsert the customer by email — reuse the existing row if the email is already known.
  let customer = await env.DB.prepare(
    `SELECT customer_id AS id, name FROM customers WHERE lower(email) = ? LIMIT 1`
  )
    .bind(email)
    .first<{ id: number; name: string | null }>();
  if (!customer) {
    const res = await env.DB.prepare(`INSERT INTO customers (name, email) VALUES (?, ?)`)
      .bind(name, email)
      .run();
    customer = { id: Number(res.meta.last_row_id), name };
  }

  // 2) Ensure an INSTANT chat account (role 'customer', status 'active' — no verification).
  const existingAccount = await env.DB.prepare(
    `SELECT 1 FROM chat_accounts WHERE email = ? LIMIT 1`
  )
    .bind(email)
    .first();
  if (!existingAccount) {
    await env.DB.prepare(
      `INSERT INTO chat_accounts (party_id, email, role, display_name, password_hash, status, email_verified)
       VALUES (?, ?, 'customer', ?, NULL, 'active', 0)`
    )
      .bind(customer.id, email, customer.name)
      .run();
  }

  // 3) Create the reservation, assigned to the pilot skipper, status 'requested'.
  const prefixRow = await env.DB.prepare(
    `SELECT code_prefix AS prefix FROM skippers WHERE skipper_id = ? LIMIT 1`
  )
    .bind(PILOT_SKIPPER_ID)
    .first<{ prefix: string | null }>();
  const prefix = prefixRow?.prefix?.trim() || "MT";
  const code = await uniqueCode(env, prefix, date, guests);

  const inserted = await env.DB.prepare(
    `INSERT INTO reservations (reservation_code, skipper_id, customer_id, guests, trip_date, status)
     VALUES (?, ?, ?, ?, ?, 'requested')`
  )
    .bind(code, PILOT_SKIPPER_ID, customer.id, guests, date)
    .run();

  return { ok: true, code, reservationId: Number(inserted.meta.last_row_id) };
}

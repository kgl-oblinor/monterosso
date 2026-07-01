// Skipper presence + live status — the TRUTHFUL replacement for the landing's old hardcoded
// "available now" badge. Status combines two honest signals:
//   1) BOOKING availability — is a confirmed trip running right now?
//   2) PROXIMITY presence   — is the skipper actually near the boat (≤ 100 m)?
//
// Presence itself has BOTH methods: AUTO (the skipper app posts GPS while it's open) and
// MANUAL (the skipper flips an "I'm at the boat" toggle). Either one, when fresh, counts.
//
// PRIVACY: the public endpoint returns ONLY the status enum + booleans — never the raw lat/lng.

import type { Env } from "./index";

// BOAT location for the pilot (Monterosso · Molo dei Pescatori). One skipper for now.
// TODO: move to the skipper record (a per-skipper boat/meeting-point lat/lng) so this scales.
const BOAT = { lat: 44.1447, lng: 9.6535 };

// Presence rules.
const PRESENCE_RADIUS_M = 100; // ≤ 100 m from the boat counts as "at the boat"
const GPS_FRESH_S = 30 * 60; // an auto GPS ping is trusted for 30 minutes
const MANUAL_FRESH_S = 4 * 60 * 60; // a manual "I'm here" toggle holds for 4 hours

export interface SkipperStatus {
  status: "available" | "booked" | "away";
  booked: boolean;
  present: boolean;
  // The effective MANUAL toggle state (on AND still fresh). For the skipper's OWN dashboard
  // only — the public route strips this so it's never exposed.
  manualAvailable: boolean;
}

// Great-circle distance between two lat/lng points, in metres.
function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000; // Earth radius (m)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

// POST /chat/me/presence — UPSERT the caller's latest GPS ping (auto presence method).
export async function reportPresence(env: Env, skipperId: number, lat: number, lng: number): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO skipper_presence (skipper_id, lat, lng, loc_updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(skipper_id) DO UPDATE SET
       lat = excluded.lat, lng = excluded.lng, loc_updated_at = excluded.loc_updated_at`
  )
    .bind(skipperId, lat, lng, nowSeconds())
    .run();
}

// POST /chat/me/available — set the manual "I'm at the boat" toggle (manual presence method).
export async function setManualAvailable(env: Env, skipperId: number, available: boolean): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO skipper_presence (skipper_id, manual_available, manual_updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(skipper_id) DO UPDATE SET
       manual_available = excluded.manual_available, manual_updated_at = excluded.manual_updated_at`
  )
    .bind(skipperId, available ? 1 : 0, nowSeconds())
    .run();
}

// Is a confirmed trip running for this skipper right now? Reservations store a trip_date (day)
// but no per-reservation slot time yet, so we take the honest, conservative reading: a 'booked'
// trip on TODAY's local date (Europe/Rome — where the pilot operates) marks the skipper booked.
// This can only ever UNDER-claim availability (never falsely say "available" over a real trip).
// TODO: once reservations carry a slot time + duration, narrow this to the actual hour window.
async function isBookedNow(env: Env, skipperId: number): Promise<boolean> {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date()); // YYYY-MM-DD
  const row = await env.DB.prepare(
    `SELECT 1 FROM reservations
      WHERE skipper_id = ? AND status = 'booked' AND trip_date = ?
      LIMIT 1`
  )
    .bind(skipperId, today)
    .first();
  return !!row;
}

// The heart of it: compute a skipper's live status from presence + bookings. Shared by the
// skipper's own dashboard (GET /chat/me/status) and the public landing (GET /public/skippers/:id/status).
export async function computeStatus(env: Env, skipperId: number): Promise<SkipperStatus> {
  const now = nowSeconds();
  const row = await env.DB.prepare(
    `SELECT lat, lng, loc_updated_at, manual_available, manual_updated_at
       FROM skipper_presence WHERE skipper_id = ? LIMIT 1`
  )
    .bind(skipperId)
    .first<{
      lat: number | null;
      lng: number | null;
      loc_updated_at: number | null;
      manual_available: number | null;
      manual_updated_at: number | null;
    }>();

  let present = false;
  let manual = false;
  if (row) {
    // AUTO: a fresh GPS ping within 100 m of the boat.
    const autoFresh = row.loc_updated_at != null && now - row.loc_updated_at <= GPS_FRESH_S;
    const autoNear =
      row.lat != null &&
      row.lng != null &&
      haversineMeters(row.lat, row.lng, BOAT.lat, BOAT.lng) <= PRESENCE_RADIUS_M;
    const auto = autoFresh && autoNear;
    // MANUAL: the toggle is on and set recently.
    manual =
      row.manual_available === 1 &&
      row.manual_updated_at != null &&
      now - row.manual_updated_at <= MANUAL_FRESH_S;
    present = auto || manual;
  }

  const booked = await isBookedNow(env, skipperId);
  const status: SkipperStatus["status"] = booked ? "booked" : present ? "available" : "away";
  return { status, booked, present, manualAvailable: manual };
}

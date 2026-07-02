// Boat verification — a PREMIUM, TRUTHFUL signal for the landing card. The rule is strict and
// objective: a skipper is "boat verified" iff they set boat_verified_at AND at least one of their
// boat photos was FRESH (uploaded within the 24 h BEFORE that verification moment). That proves
// the owner showed a recent photo of their actual boat when they verified — never faked.
//
// PRIVACY: callers surface only the boolean (+ optionally the unix timestamp). Photo URLs and
// counts stay server-side — the same discipline as presence's raw coordinates.

import type { Env } from "./index";

const DAY_S = 24 * 60 * 60; // photos must be < 24 h old at the moment of verification
const nowSeconds = () => Math.floor(Date.now() / 1000);

// POST /chat/me/boat-photos — record one uploaded boat photo/reference (uploaded_at = now).
// v1 stores the provided URL/reference only; actual image hosting to R2 is out of scope.
export async function addBoatPhoto(env: Env, skipperId: number, url: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO boat_photos (skipper_id, url, uploaded_at) VALUES (?, ?, ?)`
  )
    .bind(skipperId, url, nowSeconds())
    .run();
}

// POST /chat/me/verify-boat — stamp boat_verified_at = now ONLY IF the skipper has ≥1 boat photo
// uploaded within the last 24 h. Otherwise refuse (the caller returns a 400 with a clear message).
export async function verifyBoat(env: Env, skipperId: number): Promise<{ ok: boolean; boatVerified: boolean }> {
  const now = nowSeconds();
  const fresh = await env.DB.prepare(
    `SELECT 1 FROM boat_photos WHERE skipper_id = ? AND uploaded_at > ? LIMIT 1`
  )
    .bind(skipperId, now - DAY_S)
    .first();
  if (!fresh) return { ok: false, boatVerified: false };
  await env.DB.prepare(
    `INSERT INTO skipper_presence (skipper_id, boat_verified_at) VALUES (?, ?)
     ON CONFLICT(skipper_id) DO UPDATE SET boat_verified_at = excluded.boat_verified_at`
  )
    .bind(skipperId, now)
    .run();
  return { ok: true, boatVerified: true };
}

// The public/dashboard boolean: TRUE iff boat_verified_at is set AND at least one boat photo
// existed with uploaded_at within the 24 h BEFORE that verification moment (fresh-at-verification).
export async function isBoatVerified(
  env: Env,
  skipperId: number
): Promise<{ boatVerified: boolean; boatVerifiedAt: number | null }> {
  const row = await env.DB.prepare(
    `SELECT boat_verified_at FROM skipper_presence WHERE skipper_id = ? LIMIT 1`
  )
    .bind(skipperId)
    .first<{ boat_verified_at: number | null }>();
  const verifiedAt = row?.boat_verified_at ?? null;
  if (verifiedAt == null) return { boatVerified: false, boatVerifiedAt: null };
  // A photo counts only if it was uploaded in the 24 h window ending at the verification moment.
  const fresh = await env.DB.prepare(
    `SELECT 1 FROM boat_photos
      WHERE skipper_id = ? AND uploaded_at <= ? AND uploaded_at > ?
      LIMIT 1`
  )
    .bind(skipperId, verifiedAt, verifiedAt - DAY_S)
    .first();
  const boatVerified = !!fresh;
  return { boatVerified, boatVerifiedAt: boatVerified ? verifiedAt : null };
}

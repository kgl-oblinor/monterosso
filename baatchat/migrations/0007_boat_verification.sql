-- 0007_boat_verification.sql
-- BOAT VERIFICATION (additive, idempotent). A PREMIUM signal: a verified skipper has uploaded
-- photos of THEIR boat that were FRESH (< 24 h old) at the moment they hit "verify". The public
-- landing surfaces only a single boolean from this — never the photos or their count (privacy,
-- same discipline as presence). Timestamps are UNIX SECONDS (integers), matching presence.
--
-- boat_photos: one row per uploaded photo/reference. v1 stores the provided URL/reference +
-- when it was uploaded — actual image hosting to R2 is out of scope for v1.
CREATE TABLE IF NOT EXISTS boat_photos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    skipper_id   INTEGER NOT NULL,
    url          TEXT,
    uploaded_at  INTEGER NOT NULL   -- unix seconds the photo/reference was uploaded
);

-- When the skipper last verified their boat (unix seconds), or NULL if never. A bare ADD COLUMN
-- is safe here: a migration file runs exactly once, so it never re-adds an existing column.
ALTER TABLE skipper_presence ADD COLUMN boat_verified_at INTEGER;

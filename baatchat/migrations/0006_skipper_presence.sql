-- 0006_skipper_presence.sql
-- SKIPPER PRESENCE (additive, idempotent). One row per skipper holding the two inputs to a
-- TRUTHFUL "available now" status on the public landing: (a) an AUTOMATIC GPS ping (lat/lng +
-- when it was taken) reported by the skipper app while it's open, and (b) a MANUAL "I'm at the
-- boat" toggle (manual_available + when it was set). The public status endpoint combines these
-- with 100 m proximity to the boat + freshness windows to decide present/away — and NEVER
-- exposes the raw coordinates. No existing table is altered.
--
-- All timestamps are UNIX SECONDS (integers) — the presence code compares against now in
-- seconds; this differs from the datetime('now') text timestamps used elsewhere.

CREATE TABLE IF NOT EXISTS skipper_presence (
    skipper_id        INTEGER PRIMARY KEY REFERENCES skippers(skipper_id),
    lat               REAL,      -- last reported latitude  (auto GPS; never served publicly)
    lng               REAL,      -- last reported longitude (auto GPS; never served publicly)
    loc_updated_at    INTEGER,   -- unix seconds of the last GPS ping
    manual_available  INTEGER DEFAULT 0, -- 1 = skipper flipped "I'm at the boat · available"
    manual_updated_at INTEGER    -- unix seconds the manual toggle was last set
);

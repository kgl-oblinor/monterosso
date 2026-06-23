-- 0003_group.sql
-- GROUP CHAT + INVITES (additive). Lets a reservation/trip have MANY members ("turfølget"),
-- not just the single reservations.customer_id. The whole group = all reservation_members +
-- the reservation's skipper. The existing 1-to-1 (customer↔skipper) chat is untouched.
--
-- A member shares a GROUP thread (trip_threads, one per reservation). Messages reuse the
-- existing `messages` table via a new optional `trip_thread_id` — a message belongs to EITHER
-- the legacy 1-1 `thread_id` OR a group `trip_thread_id`. sender_role already covers everyone
-- (skipper | customer; every traveler is a customer party).

-- The members of a reservation/trip. role 'lead' is the original booker; 'guest' is invited.
CREATE TABLE IF NOT EXISTS reservation_members (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL,
    customer_id    INTEGER NOT NULL,           -- customers.customer_id (every traveler is a customer)
    role           TEXT NOT NULL DEFAULT 'guest', -- 'lead' | 'guest'
    invited_by     INTEGER,                    -- customer_id of the member who invited them (NULL for the lead)
    joined_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (reservation_id, customer_id)
);
CREATE INDEX IF NOT EXISTS idx_resmembers_reservation ON reservation_members (reservation_id);
CREATE INDEX IF NOT EXISTS idx_resmembers_customer    ON reservation_members (customer_id);

-- Backfill: every existing reservation with a customer becomes that customer's 'lead' membership.
INSERT OR IGNORE INTO reservation_members (reservation_id, customer_id, role, invited_by)
SELECT reservation_id, customer_id, 'lead', NULL
  FROM reservations
 WHERE customer_id IS NOT NULL;

-- A pending invitation to join a reservation's group. The token is the secret in the share
-- link. invited_email / invited_phone are who it's *meant* for (optional, for display only —
-- anyone with the link can join; that's the design: a frictionless share). used_at + the
-- joining customer are stamped on consumption (single-use).
CREATE TABLE IF NOT EXISTS invites (
    token          TEXT PRIMARY KEY,           -- url-safe random secret
    reservation_id INTEGER NOT NULL,
    invited_email  TEXT,
    invited_phone  TEXT,
    created_by     INTEGER NOT NULL,           -- customer_id who created the invite
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    used_at        TEXT,
    used_by        INTEGER                     -- customer_id who consumed it
);
CREATE INDEX IF NOT EXISTS idx_invites_reservation ON invites (reservation_id);

-- One GROUP thread per reservation — shared by all members + the skipper. Mirrors the
-- last-message metadata shape of `threads` so the conversation list can render it the same way.
CREATE TABLE IF NOT EXISTS trip_threads (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id       INTEGER NOT NULL,
    status               TEXT NOT NULL DEFAULT 'active', -- 'active' | 'locked' | 'archived'
    last_message_at      TEXT,
    last_message_preview TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (reservation_id)
);

-- Group messages live in the existing `messages` table, addressed by trip_thread_id instead
-- of thread_id. Exactly one of (thread_id, trip_thread_id) is set per row.
ALTER TABLE messages ADD COLUMN trip_thread_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_messages_tripthread ON messages (trip_thread_id, created_at);

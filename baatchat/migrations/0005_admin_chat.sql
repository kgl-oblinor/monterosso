-- 0005_admin_chat.sql
-- ADMIN ↔ SKIPPER support chat (additive). A direct line between the platform admin
-- (Kristian) and a skipper — support/coordination — SEPARATE from the reservation-bound
-- customer↔skipper `threads` and from the read-only "Samtaler" oversight.
--
-- Design (mirrors the group-chat pattern in 0003): ONE support thread per skipper, keyed by
-- skipper_id alone. The admin side is a single platform-support entity — the admin SessionUser
-- has a fixed party id of 0 (see auth.ts) and all allow-listed staff share the thread, so no
-- admin_id column is needed (there is nothing to disambiguate). Messages reuse the existing
-- `messages` table via a new optional `admin_thread_id`: a row now belongs to EXACTLY ONE of
-- (thread_id, trip_thread_id, admin_thread_id). sender_role 'admin' (party 0) marks the admin's
-- messages; the skipper replies as 'skipper'. Read-state reuses `read_state`, namespacing the
-- thread cursor under a large negative offset (ADMIN_READ_NS - id in adminChat.ts) so it never
-- collides with a 1-1 thread id (positive) or a group thread cursor (small negative).

CREATE TABLE IF NOT EXISTS admin_threads (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    skipper_id           INTEGER NOT NULL,
    status               TEXT NOT NULL DEFAULT 'active', -- 'active' | 'locked' | 'archived'
    last_message_at      TEXT,
    last_message_preview TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (skipper_id)
);

-- Support messages live in the existing `messages` table, addressed by admin_thread_id.
-- (Plain ADD COLUMN mirrors 0003's trip_thread_id — D1 tracks applied migrations, so this
-- file runs once; the CREATE statements above are idempotent.)
ALTER TABLE messages ADD COLUMN admin_thread_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_messages_adminthread ON messages (admin_thread_id, created_at);

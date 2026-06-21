-- 0002_chat.sql
-- Chat tables — owned by this app. Consolidates the original chat schema plus the
-- password-login and account-approval additions (this is a fresh D1, no prod data to
-- migrate). Rebranded from the loan domain: loaner→skipper, investor→customer.

CREATE TABLE IF NOT EXISTS chat_accounts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id      INTEGER NOT NULL,      -- skippers.skipper_id OR customers.customer_id
    email         TEXT NOT NULL,
    role          TEXT NOT NULL,         -- 'skipper' | 'customer'
    display_name  TEXT,
    password_hash TEXT,                  -- salted PBKDF2: "pbkdf2$<iter>$<saltB64>$<hashB64>"
    status        TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'suspended'
    email_verified INTEGER NOT NULL DEFAULT 0,
    last_login_at TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (email)
);

-- Skipper team: extra contact persons authorized to chat for a skipper/listing.
CREATE TABLE IF NOT EXISTS skipper_agents (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    skipper_id        INTEGER NOT NULL,
    agent_email       TEXT NOT NULL,
    agent_name        TEXT,
    added_by_admin    INTEGER,
    status            TEXT NOT NULL DEFAULT 'active',
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (skipper_id, agent_email)
);

CREATE TABLE IF NOT EXISTS threads (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    skipper_id           INTEGER NOT NULL,   -- the whole skipper team shares this
    customer_id          INTEGER NOT NULL,
    status               TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'locked' | 'archived'
    last_message_at      TEXT,
    last_message_preview TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (skipper_id, customer_id)
);
CREATE INDEX IF NOT EXISTS idx_threads_skipper  ON threads (skipper_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_customer ON threads (customer_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id         INTEGER NOT NULL,
    sender_party_id   INTEGER NOT NULL,
    sender_role       TEXT NOT NULL,        -- 'skipper' | 'customer'
    body              TEXT NOT NULL,
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    edited_at         TEXT,
    deleted_at        TEXT,
    moderated_by      INTEGER,
    moderation_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages (thread_id, created_at);

CREATE TABLE IF NOT EXISTS read_state (
    thread_id          INTEGER NOT NULL,
    reader_party_id    INTEGER NOT NULL,
    last_read_message_id INTEGER,
    last_read_at         TEXT,
    PRIMARY KEY (thread_id, reader_party_id)
);

CREATE TABLE IF NOT EXISTS moderation_log (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id      INTEGER NOT NULL,
    action        TEXT NOT NULL,         -- 'view_thread'|'lock_thread'|'unlock_thread'|'delete_message'|'add_agent'|'revoke_agent'
    thread_id     INTEGER,
    message_id    INTEGER,
    detail        TEXT,                  -- JSON
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

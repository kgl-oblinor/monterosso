-- 0002_chat.sql
-- Chat tables — owned by this app (not synced from Oblinor).

CREATE TABLE IF NOT EXISTS chat_accounts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    oblinor_id    INTEGER NOT NULL,      -- investors.user_id OR a loaner contact's id
    email         TEXT NOT NULL,
    role          TEXT NOT NULL,         -- 'investor' | 'loaner'
    display_name  TEXT,
    status        TEXT NOT NULL DEFAULT 'active',
    last_login_at TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (email)
);

-- Loaner team: extra contact persons authorized to chat for a loaner.
CREATE TABLE IF NOT EXISTS loaner_agents (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    loaner_id         INTEGER NOT NULL,
    agent_email       TEXT NOT NULL,
    agent_name        TEXT,
    added_by_admin    INTEGER,
    status            TEXT NOT NULL DEFAULT 'active',
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (loaner_id, agent_email)
);

CREATE TABLE IF NOT EXISTS threads (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    loaner_id            INTEGER NOT NULL,   -- the whole loaner team shares this
    investor_id          INTEGER NOT NULL,
    status               TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'locked' | 'archived'
    last_message_at      TEXT,
    last_message_preview TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (loaner_id, investor_id)
);
CREATE INDEX IF NOT EXISTS idx_threads_loaner   ON threads (loaner_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_investor ON threads (investor_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id         INTEGER NOT NULL,
    sender_oblinor_id INTEGER NOT NULL,
    sender_role       TEXT NOT NULL,        -- 'investor' | 'loaner'
    body              TEXT NOT NULL,
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    edited_at         TEXT,
    deleted_at        TEXT,
    moderated_by      INTEGER,
    moderation_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages (thread_id, created_at);

CREATE TABLE IF NOT EXISTS read_state (
    thread_id            INTEGER NOT NULL,
    reader_oblinor_id    INTEGER NOT NULL,
    last_read_message_id INTEGER,
    last_read_at         TEXT,
    PRIMARY KEY (thread_id, reader_oblinor_id)
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

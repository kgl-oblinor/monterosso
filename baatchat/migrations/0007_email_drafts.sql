-- Admin broadcast email drafts. Lets an admin save a composed email (subject + rich-text
-- body + chosen audience/recipients) and reload it later. No scheduling here — that needs
-- a cron trigger and is deferred.
CREATE TABLE IF NOT EXISTS email_drafts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    subject       TEXT NOT NULL DEFAULT '',
    html          TEXT NOT NULL DEFAULT '',
    audience      TEXT NOT NULL DEFAULT 'loaners', -- 'loaners' | 'investors' | 'all' | 'selected'
    selected_json TEXT,                            -- JSON {loaners:[Recipient], investors:[Recipient]} when 'selected'
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

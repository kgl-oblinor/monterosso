-- 0001_source.sql
-- Synced source tables — written ONLY by the Cron sync Worker (pull-only from Oblinor).
-- Mirrors the minimal §3 data slice. Nothing else from Oblinor is copied here.

CREATE TABLE IF NOT EXISTS loaners (
    loaner_id      INTEGER PRIMARY KEY,
    org_number     TEXT,
    company_name   TEXT,
    contact_person TEXT,
    username       TEXT,
    email          TEXT,
    phone          TEXT,
    address        TEXT,
    synced_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS investors (
    user_id    INTEGER PRIMARY KEY,
    name       TEXT,
    email      TEXT,
    synced_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS loans (
    loan_id        INTEGER PRIMARY KEY,
    loaner_id      INTEGER NOT NULL,
    amount         REAL,                 -- summary.amountTotal
    address        TEXT,                 -- mapaddress
    security_bail  TEXT,                 -- JSON: [{amount, owner, owner_name}]
    synced_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_loans_loaner ON loans (loaner_id);

CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY,
    loan_id    INTEGER NOT NULL,
    user_id    INTEGER,                  -- investor
    shares     INTEGER,
    amount     REAL,
    username   TEXT,
    bank_in    REAL,
    synced_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_loan ON orders (loan_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

CREATE TABLE IF NOT EXISTS sync_state (
    source         TEXT PRIMARY KEY,
    last_synced_at TEXT,
    last_error     TEXT
);

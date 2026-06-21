-- Monterosso · Cinque Terre — D1 schema (Lane D · Data/DB)
-- Database: monterosso-events  ·  binding: env.DB
--
-- Apply with:  npx wrangler d1 execute monterosso-events --remote --file=db/schema.sql
-- (see db/PLAN.md for full instructions). Statements are idempotent
-- (CREATE ... IF NOT EXISTS) so re-running is safe.
--
-- The reservation code is the join key across everything. It is generated on
-- the landing page as MT-DDMMYY-<guests> (e.g. MT-210625-2) — see
-- app/landing/Landing.js makeCode(). We store it verbatim as TEXT; there is no
-- separate bookings table yet (booking lives in Stripe + the events log below),
-- so `code` is a free-form key rather than a foreign key.

-- ---------------------------------------------------------------------------
-- events — existing lightweight visit / lead / contact tracking.
-- Already created in the live D1 and written by app/api/track/route.js.
-- Declared here (IF NOT EXISTS) so the schema file is the single source of
-- truth and a fresh DB can be bootstrapped from it. DO NOT change the column
-- list without coordinating — the /api/track INSERT is positional.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL,              -- visit | whatsapp | sms | call | lead
  code      TEXT,                       -- reservation code MT-DDMMYY-<guests>
  dato      TEXT,                       -- trip date the guest picked (free text)
  guests    INTEGER,
  city      TEXT,                       -- from Cloudflare cf.city
  country   TEXT,                       -- from Cloudflare cf.country
  ts        TEXT NOT NULL,              -- ISO-8601 timestamp
  phone     TEXT,
  email     TEXT,
  slot      TEXT,
  boarding  TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_code ON events(code);
CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events(type, ts);

-- ---------------------------------------------------------------------------
-- users — light accounts for the chat / onboarding (Lane B owns the flow).
-- No password: identity is proven by verifying email and/or phone (SMS).
-- A user may sign up with email only, phone only, or both.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,     -- app-generated id (e.g. crypto.randomUUID())
  email           TEXT,                 -- lowercased; UNIQUE when present (see index)
  phone           TEXT,                 -- E.164 e.g. +4793008600; UNIQUE when present
  email_verified  INTEGER NOT NULL DEFAULT 0,  -- 0/1 boolean
  phone_verified  INTEGER NOT NULL DEFAULT 0,  -- 0/1 boolean
  name            TEXT,                 -- optional display name
  created         TEXT NOT NULL,        -- ISO-8601
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
-- Partial unique indexes: enforce uniqueness only for rows that actually have
-- the value, so many users can have NULL email or NULL phone.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- ---------------------------------------------------------------------------
-- messages — one chat thread per reservation code, between the guest and the
-- captain (admin). Lane A (chat UI) and Lane C (admin inbox) read/write here.
-- `code` links the thread to a booking; `user_id` is optional (the captain /
-- admin replies are not tied to a guest account, and an anonymous guest may
-- chat before creating an account).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id        TEXT PRIMARY KEY,          -- app-generated id (e.g. crypto.randomUUID())
  code      TEXT NOT NULL,             -- reservation code MT-DDMMYY-<guests> (thread key)
  sender    TEXT NOT NULL,             -- customer | captain | admin
  user_id   TEXT,                      -- optional FK -> users.id (the guest)
  body      TEXT NOT NULL,
  created   TEXT NOT NULL,             -- ISO-8601
  read_at   TEXT,                      -- ISO-8601 when the other side read it (nullable)
  CHECK (sender IN ('customer', 'captain', 'admin')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Listing a thread = filter by code, ordered by time.
CREATE INDEX IF NOT EXISTS idx_messages_code_created ON messages(code, created);

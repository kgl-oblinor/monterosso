-- 0001_source.sql
-- Boat-platform domain tables. Owned by this app (no external sync — bookings come from
-- the landing/booking flow). A contact/thread is derived from a shared RESERVATION:
-- a customer and a skipper can chat when they share a reservation.
--
-- Configurable per listing: a `skippers` row carries its own service_type/location/
-- country/boat_name/code_prefix, so the platform supports many skippers and trip kinds
-- (charter, taxibåt, frakt). Nothing is hardcoded to Monterosso/Paolona.

CREATE TABLE IF NOT EXISTS skippers (
    skipper_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT,                  -- skipper / contact person
    boat_name     TEXT,                  -- e.g. "Paolona"
    listing_title TEXT,                  -- public listing name (optional override of boat_name)
    service_type  TEXT NOT NULL DEFAULT 'charter', -- 'charter' | 'taxi' | 'freight' | ...
    address       TEXT,                  -- skipper / meeting-point address
    location      TEXT,                  -- e.g. "Monterosso"
    country       TEXT,                  -- e.g. "IT"
    code_prefix   TEXT NOT NULL DEFAULT 'MT', -- reservation-code prefix for this listing
    email         TEXT,
    phone         TEXT,
    slots         TEXT,                  -- JSON array of departure times, e.g. ["09:00","14:00"]
    base_price    INTEGER,               -- price in minor units (cents)
    currency      TEXT NOT NULL DEFAULT 'EUR',
    payment_ref   TEXT,                  -- Stripe Connect account/payout id (filled later)
    active        INTEGER NOT NULL DEFAULT 1, -- listing visible/bookable
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT,
    email         TEXT,
    phone         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A booking. The reservation_code (format <prefix>-DDMMYY-<guests>, e.g. "MT-210625-2")
-- is what ties a customer to a skipper — the chat eligibility key.
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_code TEXT NOT NULL,
    skipper_id       INTEGER NOT NULL,
    customer_id      INTEGER,            -- set once the customer onboards
    guests           INTEGER,
    trip_date        TEXT,               -- ISO date of the trip
    status           TEXT NOT NULL DEFAULT 'booked', -- 'booked' | 'completed' | 'cancelled'
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (reservation_code)
);
CREATE INDEX IF NOT EXISTS idx_reservations_skipper  ON reservations (skipper_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations (customer_id);

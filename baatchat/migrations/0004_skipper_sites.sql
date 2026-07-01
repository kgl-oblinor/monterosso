-- 0004_skipper_sites.sql
-- SKIPPER "Min side" SITE CONFIG (additive). One JSON config per skipper drives that
-- skipper's PUBLIC config-driven landing (/s/<slug> in cinque-terre). baatchat OWNS this
-- config (in monterosso_chat / binding DB); the landing FETCHES it over HTTP via the
-- public read endpoint (GET /public/sites/:slug). No existing table is altered.
--
-- The stored `config` is the FULL landing config object (the exact shape the public
-- SkipperLanding.js renders — see cinque-terre/lib/skippers.js SKIPPERS.andrea) PLUS the
-- two editor-only fields the dashboard round-trips but the landing ignores: `departures`
-- and `blogPosts`. Editing "Min side" merges the editable fields into this whole object
-- and PUTs it back, so non-editable fields (intro, tours, captain, social, …) are preserved.

CREATE TABLE IF NOT EXISTS skipper_sites (
    skipper_id  INTEGER PRIMARY KEY REFERENCES skippers(skipper_id),
    slug        TEXT UNIQUE NOT NULL,      -- public URL slug, e.g. 'andrea' → /s/andrea
    config      TEXT NOT NULL,             -- JSON: the full landing config (+ departures, blogPosts)
    updated_at  TEXT
);

-- Seed the pilot skipper (Andrea Berio, skipper_id = 1) idempotently. `config` is Andrea's
-- full landing config, taken verbatim from cinque-terre/lib/skippers.js (SKIPPERS.andrea),
-- with the editor-only `departures` + `blogPosts` seeded from the "Min side" mock defaults
-- so the dashboard round-trips cleanly.
INSERT OR IGNORE INTO skipper_sites (skipper_id, slug, config, updated_at) VALUES (
    1,
    'andrea',
    '{"slug":"andrea","listingTitle":"Tiburon Boat Services","tagline":"The Cinque Terre, seen from the water.","intro":"A private tour of the five villages aboard the Paolona — a traditional Ligurian gozzo out of Monterosso, with a captain who is yours alone.","location":"Monterosso al Mare · Cinque Terre","meetingPoint":"Molo dei Pescatori, Monterosso al Mare","captain":"Andrea","coCaptain":"Davide","boatName":"Paolona","boatType":"traditional Ligurian gozzo","since":2014,"currency":"€","maxGuests":6,"pricePerGuest":100,"tours":[{"key":"coastal2h","name":"Coastal tour","duration":"2 hours","price":90,"description":"All five villages from the water, a cold drink in hand, and a local who tells the stories the ferries never stop for."},{"key":"swim3h","name":"Swim-stop tour","duration":"3 hours","price":110,"description":"The whole coast with an hour to swim in the protected coves — Guvano beach and a hidden bay just before Manarola."},{"key":"sunset","name":"Sunset tour","duration":"3 hours","price":130,"description":"Golden hour along the cliffs, a swim in two quiet coves, and the sun going down behind the point — focaccia and wine aboard."}],"whatsapp":"393406221381","phone":"+39 340 6221381","social":{"instagram":"https://www.instagram.com/tiburonboatservices/","tripadvisorRating":4.8,"tripadvisorReviews":216},"theme":{"id":"deepsea","dayNight":"auto"},"departures":[{"key":"coastal2h","label":"Coastal · 2 hours","time":"10:00"},{"key":"swim3h","label":"Swim stop · 3 hours","time":"14:00"},{"key":"sunset","label":"Sunset","time":"18:30"}],"blogPosts":[{"id":"b1","title":"Welcome aboard the Paolona","body":"Davide and I take you the whole coast — from Molo dei Pescatori past all five villages, into the quiet coves the ferries never reach.","published":true,"createdAt":"2026-06-01T08:00:00.000Z"}]}',
    datetime('now')
);

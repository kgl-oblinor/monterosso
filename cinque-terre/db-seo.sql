-- ============================================================
--  SEO micro-notes store — Monterosso · Cinque Terre
--  D1 database: monterosso-events  (binding: DB)
--  Drives the /discover section. Each row is a short, indexable
--  micro-text that publishes WITHOUT a redeploy: just INSERT a
--  row and it appears at /discover (newest first) and at its own
--  page /discover/<slug>.
--
--  Apply once:
--    wrangler d1 execute monterosso-events --remote --file=db-seo.sql
--  (drop --remote to seed the local dev DB instead.)
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_notes (
  id            TEXT PRIMARY KEY,     -- stable unique id (e.g. "2026-06-21-anchovies")
  slug          TEXT UNIQUE NOT NULL, -- URL slug, lowercase-hyphenated, stable forever
  title         TEXT NOT NULL,        -- short heading
  body          TEXT,                 -- the micro-text, 60–120 words, HTML allowed
  keyword       TEXT,                 -- the search phrase this note targets
  internal_link TEXT,                 -- one internal path to point at, e.g. "/" or "/monterosso"
  tags          TEXT,                 -- comma-separated: food, beaches, village, sea, ...
  published_at  TEXT                  -- ISO-8601 timestamp, e.g. 2026-06-21T08:00:00Z
);

-- Newest-first listing is the hot path; index the sort key.
CREATE INDEX IF NOT EXISTS idx_seo_notes_published_at ON seo_notes (published_at DESC);

-- ============================================================
--  HOW TO PUBLISH A MICRO-NOTE  (Krin runs this)
--  body: short HTML, 60–120 words. Wrap paragraphs in <p>...</p>;
--  if you write plain text instead, blank-line-separated chunks
--  become paragraphs automatically.
--  internal_link: a single internal path. The page renders a calm
--  "read more" link to it (label is chosen from the path).
--  Always escape single quotes inside text by doubling them ('').
-- ============================================================
--
-- wrangler d1 execute monterosso-events --remote --command "
--   INSERT INTO seo_notes (id, slug, title, body, keyword, internal_link, tags, published_at) VALUES (
--     '2026-06-21-anchovies',
--     'monterosso-anchovies',
--     'The anchovies of Monterosso',
--     '<p>Monterosso has salted and cured anchovies for centuries. In summer they come three ways: marinated in lemon, fried golden, or packed into the little glass jars Ligurians call <em>arbanelle</em>. Order them with a glass of Cinque Terre DOC and you have the simplest, truest plate the village offers — the taste of the sea, a few steps from where it was caught.</p>',
--     'monterosso anchovies',
--     '/monterosso',
--     'food, village',
--     '2026-06-21T08:00:00Z'
--   );
-- "
--
-- To correct a note (slug stays stable for SEO):
--   UPDATE seo_notes SET title='...', body='...' WHERE slug='monterosso-anchovies';
-- ============================================================

-- ============================================================
--  News store — Monterosso · Cinque Terre
--  D1 database: monterosso-events  (binding: DB)
--  Drives the /news section. New articles publish WITHOUT a redeploy:
--  just INSERT a row and it appears, newest first.
--
--  Apply once:
--    wrangler d1 execute monterosso-events --remote --file=db-news.sql
--  (drop --remote to seed the local dev DB instead.)
-- ============================================================

CREATE TABLE IF NOT EXISTS news (
  id           TEXT PRIMARY KEY,   -- stable unique id (e.g. a uuid or "2026-06-21-sea")
  slug         TEXT UNIQUE NOT NULL, -- URL slug, lowercase-hyphenated, stable forever
  title        TEXT NOT NULL,      -- headline
  dek          TEXT,               -- short standfirst / ingress (one or two sentences)
  body         TEXT,               -- article body (HTML or Markdown — see note below)
  tags         TEXT,               -- comma-separated: weather, food, village, sea, ...
  published_at TEXT NOT NULL       -- ISO-8601 timestamp, e.g. 2026-06-21T08:00:00Z
);

-- Newest-first listing is the hot path; index the sort key.
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news (published_at DESC);

-- ============================================================
--  HOW TO PUBLISH AN ARTICLE  (Krin runs this)
--  body: plain text/HTML. If a line is wrapped in <p>...</p> it is
--  rendered as-is; otherwise blank-line-separated paragraphs become <p>.
--  Always escape single quotes inside text by doubling them ('').
-- ============================================================
--
-- wrangler d1 execute monterosso-events --remote --command "
--   INSERT INTO news (id, slug, title, dek, body, tags, published_at) VALUES (
--     '2026-06-21-quiet-sea',
--     'a-quiet-sea-this-morning',
--     'A quiet sea this morning',
--     'Flat water off the Molo dei Pescatori, light wind from the south-west, and the first ferries already out.',
--     'The harbour woke calm today. A faint south-westerly barely troubled the surface, and by eight the sea was glass all the way to Punta Mesco.

-- It is the kind of morning the coast was made for — the villages catching the early light one by one.',
--     'weather, sea',
--     '2026-06-21T08:00:00Z'
--   );
-- "
--
-- To correct an article (slug stays stable for SEO):
--   UPDATE news SET title='...', dek='...', body='...' WHERE slug='a-quiet-sea-this-morning';
-- ============================================================

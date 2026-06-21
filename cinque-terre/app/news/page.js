import "./news.css";
import { NEWS_BASE, formatDate, parseTags, getDB } from "./_lib";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News from Monterosso — Weather, the Sea & the Village | Cinque Terre",
  description:
    "Short notes from the harbour at Monterosso — weather and sea, what's open, and small news from the Cinque Terre.",
  alternates: { canonical: `${NEWS_BASE}/news` },
  openGraph: {
    title: "News from Monterosso — Weather, the Sea & the Village",
    description:
      "Short notes from the harbour at Monterosso — weather and sea, what's open, and small news from the Cinque Terre.",
    url: `${NEWS_BASE}/news`,
    siteName: "Monterosso · Cinque Terre",
    locale: "en",
    type: "website",
  },
};

async function getArticles() {
  const db = await getDB();
  if (!db) return [];
  try {
    const r = await db
      .prepare(
        "SELECT slug, title, dek, tags, published_at FROM news ORDER BY published_at DESC, id DESC LIMIT 200"
      )
      .all();
    return r?.results || [];
  } catch {
    // Table may not exist yet (migration pending) — show the calm empty state.
    return [];
  }
}

export default async function NewsIndex() {
  const articles = await getArticles();

  return (
    <main className="news">
      <div className="news__wrap">
        <nav className="news__nav" aria-label="Primary">
          <a className="news__brand" href="/">
            Monterosso · Cinque Terre
          </a>
          <a className="news__navlink" href="/">
            The sea tour →
          </a>
        </nav>

        <header className="news__hero">
          <p className="news__eyebrow">from the harbour</p>
          <h1>News from Monterosso</h1>
          <p className="news__lede">
            Short notes from the Molo dei Pescatori — the weather and the sea,
            what is open in the village, and small news from along the Cinque
            Terre coast.
          </p>
        </header>

        {articles.length === 0 ? (
          <section className="news__empty" aria-label="No posts yet">
            <p>
              Nothing new from the harbour just yet. The first notes will appear
              here soon — come back when the sea has a story to tell.
            </p>
          </section>
        ) : (
          <ul className="news__list">
            {articles.map((a) => {
              const tags = parseTags(a.tags);
              return (
                <li className="news__item" key={a.slug}>
                  <p className="news__date">
                    <time dateTime={a.published_at}>
                      {formatDate(a.published_at)}
                    </time>
                  </p>
                  <h2>
                    <a href={`/news/${a.slug}`}>{a.title}</a>
                  </h2>
                  {a.dek ? <p className="news__dek">{a.dek}</p> : null}
                  <a className="news__more" href={`/news/${a.slug}`}>
                    Read this →
                  </a>
                  {tags.length > 0 ? (
                    <ul className="news__tags" aria-label="Tags">
                      {tags.map((t) => (
                        <li className="news__tag" key={t}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <footer className="news__foot">
          <a className="news__navlink" href="/guide">
            ← The Cinque Terre guide
          </a>
        </footer>
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import "../news.css";
import {
  NEWS_BASE,
  formatDate,
  parseTags,
  renderBody,
  getDB,
} from "../_lib";

export const dynamic = "force-dynamic";

async function getArticle(slug) {
  const db = await getDB();
  if (!db) return null;
  try {
    return await db
      .prepare(
        "SELECT slug, title, dek, body, tags, published_at FROM news WHERE slug = ?"
      )
      .bind(slug)
      .first();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) {
    return { title: "Not found — News from Monterosso" };
  }
  const url = `${NEWS_BASE}/news/${a.slug}`;
  const description = a.dek || `News from Monterosso al Mare, Cinque Terre.`;
  return {
    title: `${a.title} | News from Monterosso · Cinque Terre`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: a.title,
      description,
      url,
      siteName: "Monterosso · Cinque Terre",
      locale: "en",
      type: "article",
      publishedTime: a.published_at,
    },
  };
}

export default async function NewsArticle({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  const tags = parseTags(a.tags);
  const bodyHtml = renderBody(a.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.dek || undefined,
    datePublished: a.published_at,
    mainEntityOfPage: `${NEWS_BASE}/news/${a.slug}`,
    publisher: { "@type": "Organization", name: "Monterosso · Cinque Terre" },
  };

  return (
    <main className="news">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="news__wrap">
        <nav className="news__nav" aria-label="Primary">
          <a className="news__brand" href="/">
            Monterosso · Cinque Terre
          </a>
          <a className="news__navlink" href="/news">
            All news →
          </a>
        </nav>

        <article className="news__article">
          <header className="news__article-head">
            <p className="news__date">
              <time dateTime={a.published_at}>
                {formatDate(a.published_at)}
              </time>
            </p>
            <h1>{a.title}</h1>
            {a.dek ? <p className="news__standfirst">{a.dek}</p> : null}
            {tags.length > 0 ? (
              <ul className="news__tags" aria-label="Tags">
                {tags.map((t) => (
                  <li className="news__tag" key={t}>
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>

          {bodyHtml ? (
            <div
              className="news__body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : null}
        </article>

        <footer className="news__article-foot">
          <p>
            That quiet way of seeing the coast is exactly what we offer from the
            harbour here.
          </p>
          <a className="news__cta-link" href="/">
            See the private sea tour
          </a>
          <a className="news__back" href="/news">
            ← All news from Monterosso
          </a>
        </footer>
      </div>
    </main>
  );
}

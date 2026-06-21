import "../discover.css";
import { notFound } from "next/navigation";
import {
  getNote,
  renderBody,
  formatDate,
  excerpt,
  parseTags,
  linkLabel,
  SITE_BASE,
} from "../_lib";

// Notes publish without a redeploy, so this page must read D1 on each request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) {
    return { title: "Not found — Monterosso · Cinque Terre" };
  }
  const url = `${SITE_BASE}/discover/${note.slug}`;
  const description = excerpt(note.body, 160) || note.title;
  return {
    title: `${note.title} — Monterosso · Cinque Terre`,
    description,
    keywords: note.keyword || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: note.title,
      description,
      url,
      siteName: "Monterosso · Cinque Terre",
    },
  };
}

export default async function DiscoverNotePage({ params }) {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) notFound();

  const url = `${SITE_BASE}/discover/${note.slug}`;
  const tags = parseTags(note.tags);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: excerpt(note.body, 200) || note.title,
    datePublished: note.published_at || undefined,
    dateModified: note.published_at || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    keywords: note.keyword || (tags.length ? tags.join(", ") : undefined),
    publisher: {
      "@type": "Organization",
      name: "Monterosso · Cinque Terre",
    },
    isPartOf: {
      "@type": "Place",
      name: "Cinque Terre",
    },
  };

  return (
    <main className="discover">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="discover__wrap">
        <nav className="discover__nav" aria-label="Primary">
          <a className="discover__brand" href="/">
            Monterosso · Cinque Terre
          </a>
          <a className="discover__navlink" href="/discover">
            All notes →
          </a>
        </nav>

        <article className="discover__article">
          {note.published_at ? (
            <p className="discover__article-meta">
              {formatDate(note.published_at)}
            </p>
          ) : null}

          <h1>{note.title}</h1>

          <div
            className="discover__body"
            dangerouslySetInnerHTML={{ __html: renderBody(note.body) }}
          />

          {note.internal_link ? (
            <aside className="discover__cta">
              <p>Read on</p>
              <a href={note.internal_link}>{linkLabel(note.internal_link)} →</a>
            </aside>
          ) : null}

          {tags.length ? (
            <ul className="discover__tags" aria-label="Tags">
              {tags.map((t) => (
                <li className="discover__tag" key={t}>
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <footer className="discover__foot">
          <a className="discover__back" href="/discover">
            ← All notes
          </a>
        </footer>
      </div>
    </main>
  );
}

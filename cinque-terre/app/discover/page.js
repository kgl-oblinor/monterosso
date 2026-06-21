import "./discover.css";
import { listNotes, formatDate, excerpt, SITE_BASE } from "./_lib";

// Notes publish without a redeploy, so this page must read D1 on each request.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Discover Monterosso & the Cinque Terre — short notes from the coast",
  description:
    "Short, honest notes on Monterosso al Mare and the Cinque Terre — the food, the beaches, the villages, and the sea. A growing collection, newest first.",
  alternates: { canonical: `${SITE_BASE}/discover` },
};

export default async function DiscoverPage() {
  const notes = await listNotes();

  return (
    <main className="discover">
      <div className="discover__wrap">
        <nav className="discover__nav" aria-label="Primary">
          <a className="discover__brand" href="/">
            Monterosso · Cinque Terre
          </a>
          <a className="discover__navlink" href="/">
            The sea tour →
          </a>
        </nav>

        <header className="discover__hero">
          <p className="discover__eyebrow">discover</p>
          <h1>Notes from the coast</h1>
          <p className="discover__lede">
            Short, honest pieces on Monterosso and the Cinque Terre — the food,
            the beaches, the villages, and the light on the water. A small
            collection that grows over time.
          </p>
        </header>

        {notes.length === 0 ? (
          <section className="discover__empty" aria-label="No notes yet">
            <p>
              Nothing here just yet. The first notes are on their way — small
              pieces about the villages, the cooking, and the sea.
            </p>
            <p>
              In the meantime, the{" "}
              <a className="discover__back" href="/monterosso">
                Monterosso guide
              </a>{" "}
              is the place to start.
            </p>
          </section>
        ) : (
          <ul className="discover__list">
            {notes.map((note) => (
              <li className="discover__item" key={note.id}>
                <a className="discover__card" href={`/discover/${note.slug}`}>
                  <h2 className="discover__card-title">{note.title}</h2>
                  <p className="discover__card-excerpt">{excerpt(note.body)}</p>
                  <p className="discover__card-meta">
                    {formatDate(note.published_at)}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}

        <footer className="discover__foot">
          <a className="discover__back" href="/">
            ← Back to the sea tour
          </a>
        </footer>
      </div>
    </main>
  );
}

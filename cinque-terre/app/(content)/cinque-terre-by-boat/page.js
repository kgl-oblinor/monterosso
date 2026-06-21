import "../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/cinque-terre-by-boat";

export const metadata = {
  title: "Cinque Terre by Boat — Seeing the Five Villages from the Water",
  description:
    "The Cinque Terre was built to be seen from the sea. How the ferry works, what a private boat adds, and why the coastline looks different from the water.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "Cinque Terre by Boat — Seeing the Five Villages from the Water",
    description:
      "The coast was built facing the sea, and it still looks best from there. The ferry, a private boat, and the view from the water.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cinque Terre by Boat — Seeing the Five Villages from the Water",
  description:
    "A guide to seeing the Cinque Terre from the sea: how the seasonal ferry works, which villages it reaches, and what a small private boat adds.",
  about: { "@type": "TouristDestination", name: "Cinque Terre" },
};

export default function ByBoatPage() {
  return (
    <main className="content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="content__wrap">
        <nav className="content__nav" aria-label="Primary">
          <a className="content__brand" href="/">
            Monterosso · Cinque Terre
          </a>
          <a className="content__navlink" href="/">
            The sea tour →
          </a>
        </nav>

        <header className="content__hero">
          <p className="content__eyebrow">from the water</p>
          <h1>The Cinque Terre by boat</h1>
          <p className="content__lede">
            The five villages were built facing the sea, stacked up the rock
            above their harbours. From a deck you see them the way they were
            meant to be seen — the painted houses, the terraces, the light on the
            water. Here is how to do it, by ferry and by private boat.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="why">
          <h2 id="why">Why the coast looks best from the sea</h2>
          <p>
            The Cinque Terre — Monterosso al Mare, Vernazza, Corniglia, Manarola
            and Riomaggiore — grew up around fishing and the sea. The houses face
            the water, the harbours are the heart of each village, and the
            terraced vineyards climb the slopes behind them. From the trains and
            the trails you see fragments. From the water you see the whole
            shape of it at once — the way a sailor or a fisherman always has.
          </p>
        </section>

        <section aria-labelledby="ferry">
          <h2 id="ferry">The ferry — how it works</h2>
          <p>
            A scheduled ferry runs along the coast for the warmer half of the
            year, roughly from late March to the start of November. It calls at{" "}
            <strong>Monterosso</strong>, <strong>Vernazza</strong>,{" "}
            <strong>Manarola</strong> and <strong>Riomaggiore</strong>, and
            connects on to La Spezia, Portovenere and, in season, Levanto. The
            one village it cannot reach is <strong>Corniglia</strong>, which sits
            about a hundred metres above the sea on a rocky spur and has no
            harbour at all.
          </p>
          <p>
            Boats generally run from around nine in the morning to about six in
            the evening, with day passes available for unlimited hops. Times and
            prices change each season, so it is always worth checking the current
            timetable before you plan a day.
          </p>
          <div className="content__fact">
            The ferry is wonderful, but it runs on a fixed line and a fixed
            clock, and it fills up. A small private boat does something quieter —
            it goes where you ask, waits where the light is good, and never asks
            you to queue.
          </div>
        </section>

        <section aria-labelledby="private">
          <h2 id="private">What a private boat adds</h2>
          <p>
            On a small private tour the coast slows down. You stop where you
            want — under the Giant at Monterosso, off Vernazza&apos;s castle, by
            Manarola&apos;s tiny harbour — and you swim, or simply drift, away
            from the crowds at the docks. For an older traveller especially, it
            means seeing the whole of the Cinque Terre from a comfortable deck
            rather than a packed gangway, at a pace that is yours.
          </p>
        </section>

        <section aria-labelledby="villages">
          <h2 id="villages">The five villages from the sea</h2>
          <p>
            Each village reads differently from the water. Read more about each
            one, and how it looks from a boat:
          </p>
          <div className="content__links">
            <a href="/monterosso">Monterosso al Mare</a>
            <a href="/cinque-terre/vernazza">Vernazza</a>
            <a href="/cinque-terre/corniglia">Corniglia</a>
            <a href="/cinque-terre/manarola">Manarola</a>
            <a href="/cinque-terre/riomaggiore">Riomaggiore</a>
            <a href="/guide">The full guide →</a>
          </div>
        </section>

        <div className="content__cta">
          <p>
            We run one small private boat from Monterosso — the quiet way to see
            the coast.
          </p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>Sources</h2>
          <p>
            Researched June 2026. Nothing on this page is invented; ferry times
            and prices change each season and should be checked before travel.
          </p>
          <ul>
            <li>
              Arbaspaa — Cinque Terre ferry timetable &amp; fares 2026 (season
              ~28 March–1 November; stops at every village except Corniglia;
              ~09:00–18:00):{" "}
              <a href="https://www.arbaspaa.com/blog/cinque-terre-boat-timetable">
                arbaspaa.com/blog/cinque-terre-boat-timetable
              </a>
            </li>
            <li>
              cinqueterre-travel.com — boat service connects La Spezia /
              Portovenere with the villages; Corniglia has no harbour:{" "}
              <a href="https://cinqueterre-travel.com/getting_there/boat/">
                cinqueterre-travel.com/getting_there/boat
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

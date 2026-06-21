import "../../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/cinque-terre/vernazza";

export const metadata = {
  title: "Vernazza — The Postcard Harbour of the Cinque Terre",
  description:
    "Vernazza's tiny harbour and Doria castle make it the most photographed of the five villages. What to see, and how it sits next to Monterosso.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "Vernazza — The Postcard Harbour of the Cinque Terre",
    description:
      "The only natural harbour of the five villages, watched over by the Doria castle. What to see in Vernazza.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Vernazza",
  description:
    "Vernazza is one of the five Cinque Terre villages, in the province of La Spezia, Liguria. It is the only one of the five with a natural harbour, watched over by the medieval Doria castle.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vernazza",
    addressRegion: "Liguria",
    addressCountry: "IT",
  },
  containedInPlace: { "@type": "Place", name: "Cinque Terre" },
};

export default function VernazzaPage() {
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
          <p className="content__eyebrow">a village of the five</p>
          <h1>Vernazza</h1>
          <p className="content__lede">
            The next village down the coast from Monterosso, and the one most
            people picture when they think of the Cinque Terre — a small natural
            harbour ringed by pastel houses, a medieval castle on the rock above,
            and a church whose bell tower rises straight from the waterfront.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="harbour">
          <h2 id="harbour">The only natural harbour of the five</h2>
          <p>
            Vernazza is the only one of the five villages with a true natural
            harbour, and it shows: life gathers around{" "}
            <strong>Piazza Marconi</strong>, the little square right at the
            water&apos;s edge, where the fishing boats are pulled up and the café
            tables spill out. It has been a settlement for a very long time — the
            village passed to the Republic of Genoa in the thirteenth century —
            and that long history is written in its stone.
          </p>
        </section>

        <section aria-labelledby="see">
          <h2 id="see">What to see</h2>

          <h3>The Doria castle</h3>
          <p>
            High on the rocky spur above the harbour stands the{" "}
            <strong>Castello Doria</strong>, a fortification raised to defend the
            village against pirate raids and adapted to the shape of the rock it
            sits on. Its round lookout tower gives the best view in Vernazza —
            rooftops, the mouth of the harbour, the terraced hillsides and the
            open sea — reached by a short, steep climb from the main street.
          </p>

          <h3>Santa Margherita d&apos;Antiochia</h3>
          <p>
            On the harbour front sits the church of{" "}
            <strong>Santa Margherita d&apos;Antiochia</strong>, its octagonal
            bell tower one of the first things you see from the water. It dates
            from the early fourteenth century and stands almost on the sea.
          </p>

          <h3>The Blue Trail to Monterosso</h3>
          <p>
            Vernazza sits on the <strong>Sentiero Azzurro</strong>, the coastal
            path linking the five villages. The stretch from here to Monterosso
            is one of the classic Cinque Terre walks — a few kilometres of
            clifftop through Mediterranean scrub, with the sea below the whole
            way. You will need a Cinque Terre Card to walk it.
          </p>
        </section>

        <section aria-labelledby="boat">
          <h2 id="boat">From the water</h2>
          <p>
            Vernazza is one of the great sights of the coast from the sea — the
            harbour mouth, the castle on its spur, the campanile rising from the
            rocks. The seasonal ferry calls here on its run between Monterosso and
            the southern villages, and a small private boat can simply drift off
            the harbour mouth for the view the postcards are taken from.
          </p>
        </section>

        <section aria-labelledby="nearby">
          <h2 id="nearby">The other villages</h2>
          <div className="content__links">
            <a href="/monterosso">Monterosso al Mare</a>
            <a href="/cinque-terre/corniglia">Corniglia</a>
            <a href="/cinque-terre/manarola">Manarola</a>
            <a href="/cinque-terre/riomaggiore">Riomaggiore</a>
            <a href="/guide">The full guide →</a>
          </div>
        </section>

        <div className="content__cta">
          <p>The quietest way to see Vernazza from the water is by small boat.</p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>Sources</h2>
          <p>Researched June 2026. Nothing on this page is invented.</p>
          <ul>
            <li>
              lecinqueterre.org — the Doria castle of Vernazza (built to defend
              against pirate raids; irregular plan on the rocky spur; steep
              staircase access):{" "}
              <a href="https://www.lecinqueterre.org/eng/arte/vernazzacastello.php">
                lecinqueterre.org/eng/arte/vernazzacastello.php
              </a>
            </li>
            <li>
              Emilia Delizia &amp; cinqueterre-travel.com — Vernazza&apos;s
              natural harbour, Piazza Marconi, church of Santa Margherita
              d&apos;Antiochia, passage to Genoa, the Blue Trail to Monterosso:{" "}
              <a href="https://www.emiliadelizia.com/vernazza-cinque-terre-guide/">
                emiliadelizia.com/vernazza-cinque-terre-guide
              </a>{" "}
              ·{" "}
              <a href="https://cinqueterre-travel.com/destination/vernazza/">
                cinqueterre-travel.com/destination/vernazza
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

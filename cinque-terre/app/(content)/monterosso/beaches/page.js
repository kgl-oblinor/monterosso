import "../../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/monterosso/beaches";

export const metadata = {
  title: "The Beaches of Monterosso al Mare — Fegina & the Giant",
  description:
    "Monterosso has the only real sandy beach in the Cinque Terre. A guide to Fegina, the Giant's beach, and the old-town harbour cove.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "The Beaches of Monterosso al Mare — Fegina & the Giant",
    description:
      "The only real sandy beach in the Cinque Terre — a guide to Fegina, the Giant's beach beneath the Neptune statue, and the old-town cove.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Beaches of Monterosso al Mare — Fegina & the Giant",
  description:
    "A guide to the beaches of Monterosso al Mare, the only Cinque Terre village with substantial sandy beaches: Fegina, the Spiaggia del Gigante, and the old-town cove.",
  about: { "@type": "TouristDestination", name: "Monterosso al Mare" },
};

export default function BeachesPage() {
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
          <p className="content__eyebrow">the shore at</p>
          <h1>The beaches of Monterosso</h1>
          <p className="content__lede">
            Monterosso has the only substantial sandy beaches in the Cinque
            Terre — which is the simplest reason of all to come. A long strand by
            the station, a quieter free beach beneath the Giant, and a tiny cove
            below the old town.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="why">
          <h2 id="why">The only real sand in the Cinque Terre</h2>
          <p>
            The other four villages meet the sea with rocks and slipways.
            Monterosso alone has proper sandy beaches — the sand mixed with fine
            pebbles, soft underfoot, backed by a long seafront promenade. It is
            what makes the town the place to slow down, swim and let an afternoon
            go by.
          </p>
        </section>

        <section aria-labelledby="fegina">
          <h2 id="fegina">Fegina beach</h2>
          <p>
            The big one: <strong>Spiaggia di Fegina</strong> stretches along the
            new town, right in front of the railway station, and is the largest
            beach in the Cinque Terre. Much of it is given over to{" "}
            <em>stabilimenti</em> — the paid lidos with their rows of umbrellas
            and loungers — but there are <strong>free stretches</strong> too,
            including the Fegina free beach and the Stazione free beach beside the
            bathing establishments.
          </p>
        </section>

        <section aria-labelledby="gigante">
          <h2 id="gigante">The Giant&apos;s beach</h2>
          <p>
            At the western end of the seafront, toward Levanto, lies the{" "}
            <strong>Spiaggia del Gigante</strong> — named for{" "}
            <strong>Il Gigante</strong>, the fourteen-metre Neptune statue that
            stands on the rocks just above it. The free area here is larger and a
            good deal quieter than the main beach, with the weathered Giant
            watching over the swimmers.
          </p>
          <div className="content__fact">
            Il Gigante was built around 1910 in reinforced concrete as the
            terrace of a grand seaside villa. War-time bombing and a fierce storm
            in 1966 stripped away the great shell he once held — but he still
            stands, and the beach takes its name from him.
          </div>
        </section>

        <section aria-labelledby="oldtown">
          <h2 id="oldtown">The old-town cove</h2>
          <p>
            Below the old town, beside the ferry dock and the bell tower, is a
            small cove of sand and pebbles — the postcard view of pastel houses
            and striped umbrellas, and the spot the ferries to the other villages
            leave from.
          </p>
        </section>

        <section aria-labelledby="more">
          <h2 id="more">More of Monterosso</h2>
          <p>
            For the wider town — the old town, the Giant, the Blue Trail — see our{" "}
            <a href="/monterosso">guide to Monterosso al Mare</a>, and{" "}
            <a href="/monterosso/restaurants">where to eat</a> when you come up
            off the sand.
          </p>
        </section>

        <div className="content__cta">
          <p>
            And when the beach is enough but the coast is calling, see it from the
            water.
          </p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>Sources</h2>
          <p>Researched June 2026. Nothing on this page is invented.</p>
          <ul>
            <li>
              lecinqueterre.org — the beaches of Monterosso (Fegina, the Giant&apos;s
              beach, the old-town beach by the ferry dock):{" "}
              <a href="https://www.lecinqueterre.org/eng/beaches/beachesmonterosso.php">
                lecinqueterre.org/eng/beaches/beachesmonterosso.php
              </a>
            </li>
            <li>
              La Spezia Guide &amp; Tripadvisor — Monterosso the only village with
              substantial sandy beaches; Fegina largest in the Cinque Terre, with
              free stretches (Fegina free beach, Stazione free beach); Spiaggia
              del Gigante a larger, quieter free beach under the statue:{" "}
              <a href="https://laspeziaguide.com/insider-guide/everything-cinque-terre/cinque-terre-experiences/cinque-terre-beaches-top-spots-for-sunbathing-and-swimming/">
                laspeziaguide.com — Cinque Terre beaches
              </a>
            </li>
            <li>
              Atlas Obscura — Il Gigante (14 m, ~1910, reinforced concrete; WWII
              and 1966 storm damage):{" "}
              <a href="https://www.atlasobscura.com/places/il-gigante">
                atlasobscura.com/places/il-gigante
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

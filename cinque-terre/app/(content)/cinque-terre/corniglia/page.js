import "../../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/cinque-terre/corniglia";

export const metadata = {
  title: "Corniglia — The Cliff-Top Village with No Harbour",
  description:
    "Corniglia sits 100 m above the sea on a rocky spur — the only Cinque Terre village with no harbour, reached by 382 steps or by train.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "Corniglia — The Cliff-Top Village with No Harbour",
    description:
      "The quietest of the five, 100 m above the sea, with no harbour and no ferry — reached by the 382-step Lardarina or by train.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Corniglia",
  description:
    "Corniglia is the only one of the five Cinque Terre villages not directly on the sea — it sits about 100 metres above the water on a rocky promontory, surrounded by vineyards, in the province of La Spezia, Liguria.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Corniglia",
    addressRegion: "Liguria",
    addressCountry: "IT",
  },
  containedInPlace: { "@type": "Place", name: "Cinque Terre" },
};

export default function CornigliaPage() {
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
          <h1>Corniglia</h1>
          <p className="content__lede">
            The quiet one in the middle — and the odd one out. Corniglia is the
            only Cinque Terre village that does not sit on the water. It perches
            about a hundred metres up on a rocky spur, ringed by vineyards on
            three sides, with the sea dropping away on the fourth.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="cliff">
          <h2 id="cliff">The village with no harbour</h2>
          <p>
            Because it stands so high above the sea, Corniglia has{" "}
            <strong>no harbour</strong> — and so, alone of the five, it has no
            ferry stop. It is also the smallest and quietest of the villages,
            which is much of its charm: fewer crowds, longer views, and a slower
            afternoon. Its name is thought to come from{" "}
            <em>Gens Cornelia</em>, the Roman family that once held the land, and
            like its neighbours it passed to the Republic of Genoa in the
            thirteenth century.
          </p>
        </section>

        <section aria-labelledby="steps">
          <h2 id="steps">The Lardarina — 382 steps</h2>
          <p>
            From the train station down by the sea, the village is reached on
            foot by the <strong>Lardarina</strong>, a long brick staircase of{" "}
            <strong>382 steps</strong> that zigzags up the hillside. (A shuttle
            bus also runs for those who would rather not climb.) The reward at the
            top is the reason people come: a small, sleepy village and some of the
            widest sea views in the Cinque Terre.
          </p>
          <div className="content__fact">
            Corniglia is the only one of the five you cannot reach by boat. By
            sea you pass below it — and from the water its perch on the cliff,
            high above the vineyards, is a sight in itself.
          </div>
        </section>

        <section aria-labelledby="see">
          <h2 id="see">What to see</h2>
          <p>
            Wander the narrow main street, find the terrace at{" "}
            <strong>Santa Maria</strong> for the panorama, and look out over the
            terraced vineyards that fall away on every side. Corniglia sits on the{" "}
            <strong>Sentiero Azzurro</strong>, the Blue Trail between the
            villages, so many arrive here on foot from Vernazza or Manarola.
          </p>
        </section>

        <section aria-labelledby="nearby">
          <h2 id="nearby">The other villages</h2>
          <div className="content__links">
            <a href="/monterosso">Monterosso al Mare</a>
            <a href="/cinque-terre/vernazza">Vernazza</a>
            <a href="/cinque-terre/manarola">Manarola</a>
            <a href="/cinque-terre/riomaggiore">Riomaggiore</a>
            <a href="/guide">The full guide →</a>
          </div>
        </section>

        <div className="content__cta">
          <p>
            See the four harbour villages from the water — and Corniglia high on
            its cliff as you pass below.
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
              cinqueterre-travel.com — Corniglia ~100 m above the sea, no harbour
              and no ferry stop, surrounded by vineyards; Roman origin (Gens
              Cornelia); passed to Genoa in 1276:{" "}
              <a href="https://cinqueterre-travel.com/destination/corniglia/">
                cinqueterre-travel.com/destination/corniglia
              </a>
            </li>
            <li>
              kevmrc.com — the Lardarina staircase, 382 steps in a zigzag from
              the station to the village (with a shuttle alternative):{" "}
              <a href="https://www.kevmrc.com/corniglia-cinque-terre-italy">
                kevmrc.com/corniglia-cinque-terre-italy
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

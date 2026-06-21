import "../../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/cinque-terre/manarola";

export const metadata = {
  title: "Manarola — Vineyards, Cliffs & the Sciacchetrà Wine",
  description:
    "Manarola tumbles down the rock to a tiny harbour, surrounded by the terraced vines that make Cinque Terre's famous sweet wine. What to see.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "Manarola — Vineyards, Cliffs & the Sciacchetrà Wine",
    description:
      "Perhaps the oldest of the five, a tiny harbour squeezed between cliffs, and the terraced vines behind the sweet Sciacchetrà wine.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Manarola",
  description:
    "Manarola is one of the five Cinque Terre villages, in the province of La Spezia, Liguria. Perhaps the oldest of the five, it descends a ravine to a tiny rocky harbour and is surrounded by the terraced vineyards that produce Sciacchetrà wine.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manarola",
    addressRegion: "Liguria",
    addressCountry: "IT",
  },
  containedInPlace: { "@type": "Place", name: "Cinque Terre" },
};

export default function ManarolaPage() {
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
          <h1>Manarola</h1>
          <p className="content__lede">
            Perhaps the oldest of the five, and for many the most beautiful —
            a cascade of coloured houses down a ravine to a tiny harbour squeezed
            between two cliffs, with terraced vineyards climbing the slopes above.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="oldest">
          <h2 id="oldest">Perhaps the oldest of the five</h2>
          <p>
            Manarola may be the oldest of the Cinque Terre villages: the
            cornerstone of its church, <strong>San Lorenzo</strong>, dates from
            1338, and the present settlement is thought to go back to the end of
            the twelfth century, when people came down from the hill village of
            Volastra to live by the sea. The village runs down a ravine to the
            water, where a small rocky harbour — sheltered now by a breakwater —
            still holds the fishermen&apos;s coloured boats.
          </p>
        </section>

        <section aria-labelledby="wine">
          <h2 id="wine">The vineyards & Sciacchetrà</h2>
          <p>
            The terraces above Manarola are some of the most famous in the
            Cinque Terre, held up by ancient dry-stone walls on slopes too steep
            for any machine — what locals call <em>heroic viticulture</em>. From
            these vines comes <strong>Sciacchetrà</strong>, the region&apos;s
            celebrated golden dessert wine, made by the <em>appassimento</em>{" "}
            method: the grapes are laid out to dry so their sugars concentrate
            before pressing. It is a wine the Cinque Terre has been proud of since
            Roman times.
          </p>
          <div className="content__fact">
            Manarola&apos;s little harbour, squeezed between its cliffs, is often
            called the most photographed spot in all the Cinque Terre — and it
            looks best of all from the water.
          </div>
        </section>

        <section aria-labelledby="see">
          <h2 id="see">What to see</h2>
          <p>
            Walk down to the harbour rocks, where people swim and dive in summer;
            climb the path toward Volastra through the vines for the view back
            over the village; and look for the <strong>Via dell&apos;Amore</strong>,
            the short, famous cliff path that links Manarola to neighbouring
            Riomaggiore. Manarola is also one of the four villages the seasonal
            ferry calls at.
          </p>
        </section>

        <section aria-labelledby="nearby">
          <h2 id="nearby">The other villages</h2>
          <div className="content__links">
            <a href="/monterosso">Monterosso al Mare</a>
            <a href="/cinque-terre/vernazza">Vernazza</a>
            <a href="/cinque-terre/corniglia">Corniglia</a>
            <a href="/cinque-terre/riomaggiore">Riomaggiore</a>
            <a href="/guide">The full guide →</a>
          </div>
        </section>

        <div className="content__cta">
          <p>
            Manarola&apos;s harbour between the cliffs is one of the great sights
            from the sea.
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
              Wikipedia — <em>Manarola</em> (perhaps the oldest of the five;
              San Lorenzo cornerstone 1338; present settlement from the late 12th
              century; people descended from Volastra; Sciacchetrà):{" "}
              <a href="https://en.wikipedia.org/wiki/Manarola">
                en.wikipedia.org/wiki/Manarola
              </a>
            </li>
            <li>
              Cinque Terre Riviera — Manarola&apos;s tiny harbour squeezed
              between cliffs and protected by a breakwater; the terraced vineyards
              and Sciacchetrà (heroic viticulture, appassimento, Bosco grape):{" "}
              <a href="https://cinqueterreriviera.com/sciacchetra-wine-cinque-terre/">
                cinqueterreriviera.com/sciacchetra-wine-cinque-terre
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

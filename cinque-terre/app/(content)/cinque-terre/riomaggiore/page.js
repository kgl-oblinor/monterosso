import "../../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/cinque-terre/riomaggiore";

export const metadata = {
  title: "Riomaggiore — The Southern Gateway to the Cinque Terre",
  description:
    "Riomaggiore, the southernmost of the five, stacks pastel houses up a steep ravine above a working harbour. What to see, and the Via dell'Amore.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "Riomaggiore — The Southern Gateway to the Cinque Terre",
    description:
      "The southernmost of the five villages — pastel houses up a steep ravine, a working harbour, a medieval castle, and the start of the Via dell'Amore.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Riomaggiore",
  description:
    "Riomaggiore is the southernmost of the five Cinque Terre villages, in the province of La Spezia, Liguria. Pastel houses climb a steep ravine above a small working harbour, watched over by a medieval castle.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Riomaggiore",
    addressRegion: "Liguria",
    addressCountry: "IT",
  },
  containedInPlace: { "@type": "Place", name: "Cinque Terre" },
};

export default function RiomaggiorePage() {
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
          <h1>Riomaggiore</h1>
          <p className="content__lede">
            The southernmost of the five, and for many the gateway to the Cinque
            Terre — pastel houses stacked up a steep ravine above a small working
            harbour, with a medieval castle on the hill behind.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="south">
          <h2 id="south">The southern gateway</h2>
          <p>
            Riomaggiore is the most southerly of the five villages, the first
            most travellers reach coming from La Spezia, and is often called the
            &quot;southern jewel&quot; of the Cinque Terre. Its recorded history
            reaches back to the early thirteenth century: in 1251 the people of
            the surrounding district swore allegiance to the Republic of Genoa.
            The village tumbles down its ravine in a V toward a small jetty and
            harbour, the houses painted in orange, yellow and red.
          </p>
        </section>

        <section aria-labelledby="see">
          <h2 id="see">What to see</h2>

          <h3>The castle</h3>
          <p>
            Above the village stands the <strong>Castello di Riomaggiore</strong>,
            begun in the thirteenth century by the Turcotti marquises and later
            completed under Genoa, with a square plan and round corner towers. It
            looks out over the rooftops and the coastline.
          </p>

          <h3>The Via dell&apos;Amore</h3>
          <p>
            From Riomaggiore begins the <strong>Via dell&apos;Amore</strong>, the
            &quot;Path of Love&quot; — the short, gentle cliff walk that links the
            village to neighbouring Manarola, the easiest and most romantic
            stretch of the Blue Trail (Sentiero Azzurro) that runs the length of
            the Cinque Terre.
          </p>

          <h3>The harbour</h3>
          <p>
            The little harbour, with its slipway and the fishing boats drawn up
            among the rocks, is the heart of the village and the classic spot to
            watch the sun go down over the sea.
          </p>
        </section>

        <section aria-labelledby="boat">
          <h2 id="boat">From the water</h2>
          <p>
            Riomaggiore is one of the four villages the seasonal ferry calls at,
            and its stacked, colourful ravine is one of the finest sights of the
            whole coast from the sea — best seen, like the rest, from a small,
            unhurried boat.
          </p>
        </section>

        <section aria-labelledby="nearby">
          <h2 id="nearby">The other villages</h2>
          <div className="content__links">
            <a href="/monterosso">Monterosso al Mare</a>
            <a href="/cinque-terre/vernazza">Vernazza</a>
            <a href="/cinque-terre/corniglia">Corniglia</a>
            <a href="/cinque-terre/manarola">Manarola</a>
            <a href="/guide">The full guide →</a>
          </div>
        </section>

        <div className="content__cta">
          <p>See Riomaggiore and the whole coast from the water, at your pace.</p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>Sources</h2>
          <p>Researched June 2026. Nothing on this page is invented.</p>
          <ul>
            <li>
              Wikipedia &amp; Trainline — Riomaggiore the southernmost village;
              early-13th-century origins; allegiance to Genoa in 1251; the
              working harbour:{" "}
              <a href="https://en.wikipedia.org/wiki/Riomaggiore">
                en.wikipedia.org/wiki/Riomaggiore
              </a>{" "}
              ·{" "}
              <a href="https://www.thetrainline.com/en-us/via/europe/italy/your-guide-to-riomaggiore-the-southernmost-village-of-cinque-terre">
                thetrainline.com — guide to Riomaggiore
              </a>
            </li>
            <li>
              viadellamore.info &amp; thatsliguria.com — Castello di Riomaggiore
              (begun 1260 by the Turcotti, completed under Genoa) and the Via
              dell&apos;Amore to Manarola:{" "}
              <a href="https://www.viadellamore.info/en/castello-di-riomaggiore">
                viadellamore.info/en/castello-di-riomaggiore
              </a>{" "}
              ·{" "}
              <a href="https://thatsliguria.com/en/riomaggiore-where-starts-the-lovers-line/">
                thatsliguria.com
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

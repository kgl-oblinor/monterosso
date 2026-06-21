import "../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/guide";

export const metadata = {
  title: "The Cinque Terre Guide — Monterosso & the Five Villages",
  description:
    "A warm, honest guide to Monterosso al Mare and its neighbours — beaches, food, walks, and the sea. Written from the harbour.",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "The Cinque Terre Guide — Monterosso & the Five Villages",
    description:
      "Beaches, food, walks, and the sea — a warm, honest guide to Monterosso al Mare and the five villages, written from the harbour.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "The Cinque Terre Guide — Monterosso & the Five Villages",
  description:
    "A guide hub to Monterosso al Mare and the Cinque Terre: villages, beaches, food and seeing the coast by boat.",
  about: { "@type": "TouristDestination", name: "Cinque Terre" },
};

const cards = [
  {
    href: "/monterosso",
    title: "Monterosso al Mare",
    text: "The seaside heart of the five — sandy beach, medieval old town, and the Giant.",
  },
  {
    href: "/cinque-terre-by-boat",
    title: "The coast by boat",
    text: "Why the villages look best from the water, and how the ferry works.",
  },
  {
    href: "/cinque-terre/vernazza",
    title: "Vernazza",
    text: "The only natural harbour of the five, watched over by the Doria castle.",
  },
  {
    href: "/cinque-terre/corniglia",
    title: "Corniglia",
    text: "The quiet cliff-top village, 100 m above the sea, with no harbour at all.",
  },
  {
    href: "/cinque-terre/manarola",
    title: "Manarola",
    text: "Vineyards, a tiny harbour, and the sweet Sciacchetrà wine.",
  },
  {
    href: "/cinque-terre/riomaggiore",
    title: "Riomaggiore",
    text: "The southern gateway, pastel houses stacked above a working harbour.",
  },
  {
    href: "/monterosso/beaches",
    title: "Monterosso's beaches",
    text: "Fegina, the Giant's beach, and the old-town cove — the only real sand in the Cinque Terre.",
  },
  {
    href: "/monterosso/restaurants",
    title: "Where to eat",
    text: "Anchovies, trofie al pesto, focaccia, and a glass of Cinque Terre white.",
  },
];

export default function GuidePage() {
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
          <p className="content__eyebrow">a guide to</p>
          <h1>The Cinque Terre</h1>
          <p className="content__lede">
            Five small villages on a fold of the Ligurian coast, where the
            mountains drop into the sea. This is our guide to them — written from
            the harbour at Monterosso, where we keep our boat — with honest,
            researched notes on each village, the beaches, the food, and the sea.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="explore">
          <h2 id="explore">Explore the guide</h2>
          <div className="content__grid">
            {cards.map((c) => (
              <a key={c.href} className="content__card" href={c.href}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="five">
          <h2 id="five">The five villages</h2>
          <p>
            From west to south they run{" "}
            <strong>Monterosso al Mare</strong>, <strong>Vernazza</strong>,{" "}
            <strong>Corniglia</strong>, <strong>Manarola</strong> and{" "}
            <strong>Riomaggiore</strong>. Together with the surrounding
            hillsides they form the Cinque Terre — &quot;the five lands&quot; —
            a stretch of terraced coast in the province of La Spezia. Four sit on
            the water with small harbours; Corniglia alone perches high on a
            cliff. A seasonal ferry links them all but Corniglia, and the Blue
            Trail (Sentiero Azzurro) walks between them.
          </p>
        </section>

        <div className="content__cta">
          <p>
            And when you would rather see it all from the water — quietly, at
            your own pace — that is what we offer.
          </p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>About this guide</h2>
          <p>
            Written and researched June 2026 from Monterosso al Mare. Every
            individual guide page lists its own sources; nothing here is
            invented.
          </p>
        </footer>
      </div>
    </main>
  );
}

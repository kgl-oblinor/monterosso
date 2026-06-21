import "../../content.css";

const url = "https://monterosso-cinque-terre.kgl-56a.workers.dev/monterosso/restaurants";

export const metadata = {
  title: "Where to Eat in Monterosso — Anchovies, Pesto & Local Wine",
  description:
    "Monterosso's table: fresh anchovies prepared a dozen ways, trofie al pesto, focaccia, and a glass of Cinque Terre white or sweet Sciacchetrà.",
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Monterosso · Cinque Terre",
    title: "Where to Eat in Monterosso — Anchovies, Pesto & Local Wine",
    description:
      "Anchovies cured in arbanelle jars, trofie al pesto, focaccia and farinata, and the wines of the Cinque Terre — what to eat in Monterosso.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Where to Eat in Monterosso — Anchovies, Pesto & Local Wine",
  description:
    "A guide to the food of Monterosso al Mare and the Cinque Terre: anchovies, trofie al pesto, focaccia, farinata, and the local Cinque Terre DOC and Sciacchetrà wines.",
  about: { "@type": "TouristDestination", name: "Monterosso al Mare" },
};

export default function RestaurantsPage() {
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
          <p className="content__eyebrow">the table at</p>
          <h1>Eating in Monterosso</h1>
          <p className="content__lede">
            This is anchovy country, pesto country, focaccia country. The food of
            Monterosso and the Cinque Terre is simple, coastal and Ligurian — the
            sea on one side, the terraced hills on the other. Here is what to look
            for, and what to drink with it.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="anchovies">
          <h2 id="anchovies">The anchovies</h2>
          <p>
            Monterosso has caught and cured <strong>anchovies</strong> —{" "}
            <em>acciughe</em> — for centuries; in Ligurian dialect they are even
            called <em>pan do ma</em>, &quot;bread of the sea&quot;. Here they
            come fresh, not from a tin: marinated raw in lemon, herbs and olive
            oil; fried golden; or salted and packed into the little glass jars
            locals call <em>arbanelle</em>. They are the taste of the town, and
            the thing to order first.
          </p>
          <div className="content__fact">
            Time your visit for the Sagra dell&apos;Acciuga Fritta — the Fried
            Anchovy Festival — held on the third Saturday of June, when the town
            fries its famous little fish in the open air.
          </div>
        </section>

        <section aria-labelledby="pesto">
          <h2 id="pesto">Pesto, trofie & the Ligurian plate</h2>
          <p>
            Liguria is the home of <strong>pesto</strong> — basil, pine nuts,
            garlic, Parmigiano and Pecorino, sea salt and Ligurian olive oil,
            pounded together. It is classically served on{" "}
            <strong>trofie</strong>, a short twisted pasta whose crevices hold the
            sauce, often with potatoes and green beans tumbled in. Alongside it
            you will find <strong>focaccia</strong>, the region&apos;s soft, oily,
            salted flatbread, and <strong>farinata</strong>, a thin chickpea-flour
            flatbread baked crisp — plus a <em>frittura mista</em>, a mixed fry of
            the day&apos;s catch.
          </p>
        </section>

        <section aria-labelledby="wine">
          <h2 id="wine">The wines</h2>
          <p>
            Two local wines belong on the table. The{" "}
            <strong>Cinque Terre DOC</strong> is a crisp dry white built around
            the native Bosco grape, with Albarola and Vermentino — the everyday
            wine of the coast. Its rare and celebrated cousin is{" "}
            <strong>Sciacchetrà</strong>, a golden sweet <em>passito</em> made
            from grapes dried to concentrate their sugar, grown on the steep
            terraced vineyards above the villages. Pour it at the end of a long
            lunch.
          </p>
        </section>

        <section aria-labelledby="note">
          <h2 id="note">A note on where</h2>
          <p>
            We do not list specific restaurants here — they change, and the
            honest advice is simply to eat near the harbour, choose the place that
            has anchovies prepared more than one way, and trust the catch of the
            day. For more of the town, see our{" "}
            <a href="/monterosso">guide to Monterosso al Mare</a> and its{" "}
            <a href="/monterosso/beaches">beaches</a>.
          </p>
        </section>

        <div className="content__cta">
          <p>
            After lunch, the gentlest way to see the coast is from the water.
          </p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>Sources</h2>
          <p>
            Researched June 2026. Nothing here is invented; we deliberately name
            no specific restaurants, as those change year to year.
          </p>
          <ul>
            <li>
              The Mediterranean Traveller — Cinque Terre food: anchovies
              (&quot;pan do ma&quot;), trofie al pesto, focaccia, farinata, and
              Sciacchetrà:{" "}
              <a href="https://www.themediterraneantraveller.com/cinque-terre-food/">
                themediterraneantraveller.com/cinque-terre-food
              </a>
            </li>
            <li>
              Emilia Delizia — Monterosso anchovies cured in arbanelle jars;
              Cinque Terre DOC (Bosco, Albarola, Vermentino) and Sciacchetrà DOC
              passito:{" "}
              <a href="https://www.emiliadelizia.com/monterosso-al-mare-the-beachside-gem-of-the-cinque-terre/">
                emiliadelizia.com
              </a>
            </li>
            <li>
              Cinque Terre Riviera — Fried Anchovy Festival, third Saturday of
              June:{" "}
              <a href="https://cinqueterreriviera.com/fried-anchovy-festival-in-monterosso-al-mare-a-must-event-for-all-the-food-lovers/">
                cinqueterreriviera.com
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

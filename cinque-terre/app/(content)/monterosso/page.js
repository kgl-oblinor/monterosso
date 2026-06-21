import "../content.css";

export const metadata = {
  title:
    "Monterosso al Mare — Things to Do, Beaches & the Old Town | Cinque Terre",
  description:
    "Monterosso al Mare is the seaside heart of the Cinque Terre — a sandy beach, a medieval old town, the 14-metre Giant, and the salt-cured anchovies Liguria is known for. A local's guide.",
};

// JSON-LD structured data for the place. Helps search engines understand the page.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Monterosso al Mare",
  description:
    "Monterosso al Mare is the westernmost of the five Cinque Terre villages, in the province of La Spezia, Liguria. It has the only true sandy beach of the five, a medieval old town, and a long tradition of anchovy fishing.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Monterosso al Mare",
    addressRegion: "Liguria",
    addressCountry: "IT",
  },
  containedInPlace: { "@type": "Place", name: "Cinque Terre" },
};

export default function MonterossoPage() {
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
          <h1>Monterosso al Mare</h1>
          <p className="content__lede">
            The widest, gentlest harbour of the Cinque Terre — the only one with
            a real sandy beach, a medieval old town behind it, and a fourteen-metre
            stone giant watching the waves. Here is what to see, where to eat, and
            why the coast looks best from the water.
          </p>
          <p className="content__meta">Liguria · Province of La Spezia · Italy</p>
        </header>

        <section aria-labelledby="about">
          <h2 id="about">The seaside heart of the five villages</h2>
          <p>
            Monterosso al Mare is the westernmost of the five Cinque Terre
            villages, strung along a fold of the Ligurian coast where the
            mountains drop straight into the sea. It is the largest and most
            open of the five — a small place still, home to around 1,300 people,
            but the one with room to breathe, to lie on the sand, and to watch
            the light change over the water.
          </p>
          <p>
            The town comes in two halves. The <strong>old town</strong> is the
            medieval one: narrow lanes, pastel houses, the bell tower of the
            church above the harbour. The <strong>new town</strong>, called{" "}
            <strong>Fegina</strong>, runs along the shore on the other side of
            the San Cristoforo hill, joined to the old town by a short pedestrian
            tunnel. Fegina holds the railway station and the long beach; the old
            town holds the history.
          </p>
        </section>

        <section aria-labelledby="things">
          <h2 id="things">Things to do</h2>

          <h3>Walk the old town</h3>
          <p>
            Wander the carruggi — the narrow stone alleys — past the{" "}
            <strong>Church of San Giovanni Battista</strong>, built between 1282
            and 1307, and up toward the sixteenth-century{" "}
            <strong>Aurora Tower</strong>. The Genoese raised that tower, and the
            walls around it, to fend off the Saracen pirate raids that once
            haunted this coast. Above the village stands the Capuchin monastery,
            quiet and worth the climb.
          </p>

          <h3>See the Giant</h3>
          <p>
            On the rocks at the western end of Fegina beach stands{" "}
            <strong>Il Gigante</strong> — a fourteen-metre figure of Neptune,
            built around 1910 in reinforced concrete by the sculptor Arrigo
            Minerbi and the architect Francesco Levacher. He was once the terrace
            of a grand seaside villa, the Villa Pastine, holding a giant shell
            above his head. Allied bombing in the Second World War and a fierce
            storm in 1966 took the shell and much else, but the Giant still
            stands, weathered and watching.
          </p>

          <h3>Hike the Blue Trail</h3>
          <p>
            The <strong>Sentiero Azzurro</strong>, the coastal path that links
            all five villages, begins on a small trail above the old town. It is
            the classic Cinque Terre walk, with the sea on one side and terraced
            hillsides on the other. You will need a Cinque Terre Card to use it,
            and it is worth checking which sections are open before you set out.
          </p>

          <h3>Slow down on the sand</h3>
          <p>
            Monterosso has the only proper sandy beach in the Cinque Terre, which
            is the simplest reason of all to come — to swim, to read, and to let
            an afternoon go by.
          </p>
        </section>

        <section aria-labelledby="beaches">
          <h2 id="beaches">The beaches</h2>
          <ul>
            <li>
              <strong>Fegina beach</strong> — the long one, just steps from the
              train station; the largest and most popular in the Cinque Terre.
            </li>
            <li>
              <strong>The Giant&apos;s beach</strong> (Spiaggia del Gigante) — a
              smaller pebbly cove just west, beneath the Neptune statue.
            </li>
            <li>
              <strong>The old-town cove</strong> — the tiny harbour beach below
              the bell tower; the classic postcard view of pastel houses and
              striped umbrellas.
            </li>
          </ul>
        </section>

        <section aria-labelledby="eat">
          <h2 id="eat">Where to eat — anchovies, pesto & local wine</h2>
          <p>
            Monterosso has caught and cured <strong>anchovies</strong> for
            centuries. Here they come fresh: marinated in lemon, fried golden, or
            salted and packed into the little glass jars Ligurians call{" "}
            <em>arbanelle</em>. They are the taste of the town. Beyond them, look
            for <strong>trofie al pesto</strong> — the short twisted pasta with
            Liguria&apos;s basil, pine-nut and olive-oil sauce — alongside
            focaccia, farinata (a chickpea flatbread), and a mixed fry of the
            day&apos;s catch.
          </p>
          <p>
            To drink, two local wines. The <strong>Cinque Terre DOC</strong> is a
            dry white from the native Bosco grape with Albarola and Vermentino.
            The <strong>Sciacchetrà</strong> is its rare sweet cousin — a{" "}
            <em>passito</em> made from grapes dried on racks for months, poured at
            the end of a long lunch.
          </p>
          <div className="content__fact">
            If you can, come for the Sagra dell&apos;Acciuga Fritta — the Fried
            Anchovy Festival — held on the third Saturday of June, when the town
            fries its famous little fish in the open air.
          </div>
        </section>

        <section aria-labelledby="nearby">
          <h2 id="nearby">The neighbouring villages</h2>
          <p>
            Monterosso is one of five. Heading down the coast you reach{" "}
            <strong>Vernazza</strong> with its postcard harbour,{" "}
            <strong>Corniglia</strong> perched high on a cliff with no harbour at
            all, <strong>Manarola</strong> in its vineyards, and{" "}
            <strong>Riomaggiore</strong> at the southern end. A ferry runs the
            coast from spring to autumn, calling at every village except Corniglia
            — which sits too high above the sea for a harbour, and must be reached
            by train or on foot.
          </p>
        </section>

        <section aria-labelledby="boat">
          <h2 id="boat">Seeing it from the water</h2>
          <p>
            The Cinque Terre was built facing the sea, and it still looks best
            from there — the painted houses stacked up the rock, the terraces, the
            Giant on his ledge. A scheduled ferry will carry you between the
            villages. A small private boat does something quieter: it stops where
            you want, drifts where the light is good, and lets an older traveller
            see the whole coast from a deck rather than a crowd.
          </p>
        </section>

        <div className="content__cta">
          <p>That quiet way of seeing the coast is exactly what we offer.</p>
          <a className="content__cta-link" href="/">
            See the private sea tour
          </a>
        </div>

        <footer className="content__foot">
          <h2>Sources</h2>
          <p>
            Every fact on this page is drawn from the sources below (researched
            June 2026). Nothing here is invented.
          </p>
          <ul>
            <li>
              Wikipedia — <em>Monterosso al Mare</em> (westernmost of the five;
              population ~1,314, 2024; province of La Spezia; Church of San
              Giovanni Battista, 1282–1307):{" "}
              <a href="https://en.wikipedia.org/wiki/Monterosso_al_Mare">
                en.wikipedia.org/wiki/Monterosso_al_Mare
              </a>
            </li>
            <li>
              Along Dusty Roads — old town vs Fegina, San Cristoforo tunnel,
              sandy beach, Aurora Tower, Blue Trail &amp; Cinque Terre Card:{" "}
              <a href="https://www.alongdustyroads.com/posts/monterosso-al-mare-cinque-terre">
                alongdustyroads.com
              </a>
            </li>
            <li>
              Atlas Obscura &amp; lecinqueterre.org — Il Gigante (14 m Neptune;
              Minerbi &amp; Levacher; ~1910; Villa Pastine; WWII &amp; 1966
              damage):{" "}
              <a href="https://www.atlasobscura.com/places/il-gigante">
                atlasobscura.com/places/il-gigante
              </a>{" "}
              ·{" "}
              <a href="https://www.lecinqueterre.org/eng/arte/monterossostatuagigante.php">
                lecinqueterre.org
              </a>
            </li>
            <li>
              Emilia Delizia — anchovies (arbanelle), trofie al pesto, Cinque
              Terre DOC &amp; Sciacchetrà:{" "}
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
            <li>
              cinqueterre-travel.com — ferries stop at every village except
              Corniglia (no harbour), seasonal spring–autumn service:{" "}
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

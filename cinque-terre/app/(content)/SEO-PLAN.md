# SEO & Content Plan — Monterosso / Cinque Terre

> Owner: **SEO lane**. These pages exist **only to win search traffic** and funnel readers
> back to the booking landing page (`/`). Warm but tight English copy, researched facts only,
> never invented claims. Reuses the design feeling (cream, Fraunces, sharp edges) via its own
> stylesheet `app/(content)/content.css` — it never imports or edits `landing.css`.

---

## 1. Why these pages exist

The landing page (`/`) is a single, immersive booking experience — great for conversion, weak
for SEO (one route, little indexable text). People planning a trip search things like
*"things to do in Monterosso"*, *"Cinque Terre by boat"*, *"best beach Cinque Terre"*.
The content pages capture that intent, rank in Google, and hand the warm reader a single quiet
CTA: **see the private sea tour →** (links to `/`).

Every content page must:
- answer a real search intent with genuine, sourced facts,
- read warm but tight (never "BOOK NOW!"), matching the brand voice,
- carry clean SEO metadata + semantic HTML,
- link internally (hub-and-spoke) and end with one calm link back to the tour.

---

## 2. Current state (audit)

`cinque-terre/app/` today contains **no content/place pages**. Existing routes are functional,
not editorial: `landing/` (home), `chat/`, `admin/`, `(auth)/`, `map/`, `success/`, `cancel/`,
`api/`. So the entire `(content)` route group below is greenfield and owned by this lane.

The `(content)` parentheses make it a **route group** — it organises files without adding a URL
segment, so pages live at clean paths like `/monterosso`, not `/content/monterosso`.

---

## 3. Proposed site structure (hub & spoke)

```
/guide                         → content hub / index (links to everything below)
/monterosso                    → PILOT (built): Monterosso al Mare — things to do & places
/cinque-terre-by-boat          → why see the coast from the water; ferry vs private tour
/cinque-terre/vernazza         → neighbouring village guide
/cinque-terre/corniglia        → neighbouring village guide (the cliff-top one, no harbour)
/cinque-terre/manarola         → neighbouring village guide
/cinque-terre/riomaggiore      → neighbouring village guide
/monterosso/restaurants        → where to eat: anchovies, pesto, Sciacchetrà
/monterosso/beaches            → Fegina, Giant's beach, old-town harbour beach
/news                          → news/blog index (see §6 — reserved for the daily-news agent)
/news/[slug]                   → individual daily post
```

Build order (priority by search value): `/monterosso` (done) → `/cinque-terre-by-boat`
→ `/guide` hub → village pages → `/monterosso/restaurants` + `/beaches` → wire up `/news`.

**Build status (SEO-2 agent, June 2026):** All content pages above are now built and
live in-repo except the reserved `/news` track:
- ✅ `/monterosso` (pilot, prior agent)
- ✅ `/cinque-terre-by-boat`
- ✅ `/guide` (hub, links to every page via card grid)
- ✅ `/cinque-terre/vernazza`, `/corniglia`, `/manarola`, `/riomaggiore`
- ✅ `/monterosso/restaurants`, `/monterosso/beaches`
- ✅ `app/sitemap.js` + `app/robots.js` (Next 15 convention; sitemap lists all the
  above + `/`, omits `/news` until those pages exist so we never list 404s)
- ✅ Per-page `openGraph` + `alternates.canonical` added on every new page
  (canonical base = `https://monterosso-cinque-terre.kgl-56a.workers.dev`, the live
  workers.dev URL from MÅL.md — swap to a custom domain here + in sitemap/robots once one exists)
- ⏳ `/news` + `/news/[slug]` — still reserved, NOT built (separate daily-news agent)

### URL conventions
- All lowercase, hyphenated, no trailing segment from the route group.
- Village pages nested under `/cinque-terre/<village>` so the five form a clear cluster.
- Monterosso sub-topics nested under `/monterosso/<topic>` (it is the pilot town / our home).
- Keep slugs stable once published (URLs are SEO equity; don't rename later).

---

## 4. Titles & meta (per page)

| Route | `<title>` | meta description |
|---|---|---|
| `/monterosso` | Monterosso al Mare — Things to Do, Beaches & the Old Town \| Cinque Terre | Monterosso al Mare is the seaside heart of the Cinque Terre — a sandy beach, a medieval old town, the 14-metre Giant, and the best anchovies in Liguria. A local's guide. |
| `/cinque-terre-by-boat` | Cinque Terre by Boat — Seeing the Five Villages from the Water | The Cinque Terre was built to be seen from the sea. How the ferry works, what a private boat adds, and why the coastline looks different from the water. |
| `/guide` | The Cinque Terre Guide — Monterosso & the Five Villages | A warm, honest guide to Monterosso al Mare and its neighbours — beaches, food, walks, and the sea. Written from the harbour. |
| `/cinque-terre/vernazza` | Vernazza — The Postcard Harbour of the Cinque Terre | Vernazza's tiny harbour and Doria castle make it the most photographed of the five villages. What to see, and how it sits next to Monterosso. |
| `/cinque-terre/corniglia` | Corniglia — The Cliff-Top Village with No Harbour | Corniglia sits 100 m above the sea on a rocky spur — the only Cinque Terre village with no harbour, reached by 382 steps or train. |
| `/cinque-terre/manarola` | Manarola — Vineyards, Cliffs & the Sciacchetrà Wine | Manarola tumbles down the rock to a small harbour, surrounded by the terraced vines that make Cinque Terre's famous sweet wine. |
| `/cinque-terre/riomaggiore` | Riomaggiore — The Southern Gateway to the Cinque Terre | Riomaggiore, the southernmost of the five, stacks pastel houses up a steep ravine above a working harbour. |
| `/monterosso/restaurants` | Where to Eat in Monterosso — Anchovies, Pesto & Local Wine | Monterosso's table: fresh anchovies prepared a dozen ways, trofie al pesto, focaccia, and a glass of Cinque Terre white or sweet Sciacchetrà. |
| `/monterosso/beaches` | The Beaches of Monterosso al Mare — Fegina & the Giant | Monterosso has the only real sandy beach in the Cinque Terre. A guide to Fegina, the Giant's beach, and the old-town harbour cove. |
| `/news` | News from Monterosso — Weather, the Sea & the Village | Short daily notes from the harbour at Monterosso — weather and sea, what's open, and small news from the Cinque Terre. |

Notes:
- Keep titles ~55–60 chars before the brand suffix where possible; descriptions ~150–160 chars.
- Each page sets `metadata` via Next.js App Router `export const metadata`.
- Add `openGraph` + `alternates.canonical` per page once a real domain is fixed (TODO below).

---

## 5. Internal linking

- **Hub:** `/guide` links out to every content page (and is linked from each page's footer).
- **Spoke → hub & siblings:** every village page links to the other four + back to `/guide`.
- **Pilot funnel:** every content page ends with ONE calm link to the booking experience (`/`),
  styled as the brand's quiet CTA ("See the private sea tour →"), never a hard sell.
- **Topical clusters:** `/monterosso` links down to `/monterosso/beaches` & `/restaurants`;
  `/cinque-terre-by-boat` links to all village pages (boat connects every village but Corniglia).
- **Avoid orphan pages:** nothing ships without at least one inbound internal link from the hub.

---

## 6. News / blog hook (reserved — do NOT build the agent now)

A later agent will publish **one short post per day** (weather/wind/temperature, restaurants,
things to do, neighbouring villages, boat history). To make that drop in cleanly:

- Reserve `/news` (index) and `/news/[slug]` (post). The index lists posts newest-first.
- Posts should be simple front-matter + body (e.g. MDX or a small JSON/MD store under
  `app/(content)/news/_posts/`), so the daily agent only adds a file — never touches page code.
- Each post: `title`, `date`, `summary`, `body`, optional `tags` (weather | food | village | sea).
- The hub `/guide` and `/monterosso` should link to `/news` so the freshest content is reachable
  (fresh, dated content also helps the whole cluster's SEO).
- The news index/detail pages can reuse `content.css` — same cream/Fraunces look.

This plan only **reserves the slot and structure**; the news pages and agent are out of scope here.

---

## 7. Technical SEO checklist (cluster-wide TODO)

- [x] `sitemap.xml` via `app/sitemap.js` listing all content routes + `/` (news routes omitted until built).
- [x] `robots.txt` via `app/robots.js` allowing crawl, pointing to sitemap.
- [x] Per-page `alternates.canonical` + `openGraph` (using the live workers.dev domain; revisit if a custom domain is added).
- [x] JSON-LD: `TouristDestination` on the village/place pages; `Article` on by-boat/restaurants/beaches; `CollectionPage` on `/guide`. (`Article` on news posts still pending the news agent.)
- [x] One `<h1>` per page, descriptive `<h2>`/`<h3>`, real `<section>`/`<nav>`/`<header>`/`<footer>` semantics.
- [ ] Descriptive `alt` text on every image once imagery is added (no imagery on these pages yet).
- Note: `app/sitemap.js` / `app/robots.js` sit at the app root (shared) — coordinate before adding
  so this lane doesn't collide with LAND/DASH. Until then, per-page `metadata` is fully in-lane.

---

## 8. Sources & fact notes (for the pilot page, /monterosso)

All facts on the pilot page trace to these sources (researched June 2026). No fact was invented.

- **Westernmost of the five; population 1,314 (June 2024); province of La Spezia, Liguria;
  parish Church of St John the Baptist dates 1282–1307; town split into old town + new town.**
  — Wikipedia, *Monterosso al Mare*. https://en.wikipedia.org/wiki/Monterosso_al_Mare
  (Note: Wikipedia says **westernmost**, correcting the common "northernmost" claim. The page uses
  "westernmost / at the northern end of the chain" carefully — verified against this source.)
- **Old town vs Fegina (new town) split by the San Cristoforo hill and joined by a pedestrian
  tunnel; Fegina holds the railway station and the best beach; old town has the Aurora Tower,
  Church of San Giovanni Battista, Capuchin monastery; only Cinque Terre village with a proper
  sandy beach; Sentiero Azzurro (Blue Trail) begins above the old town; Cinque Terre Card needed
  for the trail.** — Along Dusty Roads guide. https://www.alongdustyroads.com/posts/monterosso-al-mare-cinque-terre ;
  cinqueterre-travel.com. https://cinqueterre-travel.com/destination/monterosso/
- **Il Gigante: 14 m Neptune statue by sculptor Arrigo Minerbi & architect Francesco Levacher,
  built ~1910 in reinforced concrete as the terrace decoration of Villa Pastine; damaged by WWII
  allied bombing and further by heavy seas in 1966.** — Atlas Obscura. https://www.atlasobscura.com/places/il-gigante ;
  lecinqueterre.org. https://www.lecinqueterre.org/eng/arte/monterossostatuagigante.php
- **16th-century Aurora Tower built by the Genoese as defence against Saracen pirate raids;
  medieval dry-stone terraces for olives, grapes and lemons.** — Wikipedia (above) + cinqueterre-travel.com (above).
- **Food: anchovies (acciughe) salted in "arbanelle" jars, marinated in lemon or fried; trofie
  al pesto; focaccia; farinata; frittura mista; mussels. Wines: Cinque Terre DOC dry white (Bosco,
  Albarola, Vermentino) and Sciacchetrà DOC sweet passito.** — Emilia Delizia. https://www.emiliadelizia.com/monterosso-al-mare-the-beachside-gem-of-the-cinque-terre/ ;
  Along Dusty Roads (above).
- **Fried Anchovy Festival (Sagra dell'Acciuga Fritta), held the third Saturday of June.**
  — Cinque Terre Riviera. https://cinqueterreriviera.com/fried-anchovy-festival-in-monterosso-al-mare-a-must-event-for-all-the-food-lovers/
- **Ferries connect Monterosso–Portovenere/La Spezia and stop at every village EXCEPT Corniglia
  (no harbour); service ~late March to early November; first boat ~09:00, last ~18:00.**
  — cinqueterre-travel.com (boat). https://cinqueterre-travel.com/getting_there/boat/ ;
  Arbaspaa 2026 timetable. https://www.arbaspaa.com/blog/cinque-terre-boat-timetable

Facts deliberately NOT used (unverifiable / would be invention): specific restaurant names,
exact current ferry prices on the pilot page (prices change yearly — kept vague), and any claim
about our own tour's schedule beyond what the landing page states.

### 8b. Sources for the new pages (SEO-2 agent, researched June 2026)

All facts researched via web search; nothing invented. Per-village pages each repeat their
own sources in-page (footer).

- **Vernazza — only natural harbour of the five; Piazza Marconi; Castello Doria built to defend
  against pirate raids on a rocky spur (steep staircase access); church of Santa Margherita
  d'Antiochia on the harbour (early 14th c.); passed to Genoa in the 13th c.; Blue Trail to
  Monterosso.** — lecinqueterre.org. https://www.lecinqueterre.org/eng/arte/vernazzacastello.php ;
  Emilia Delizia. https://www.emiliadelizia.com/vernazza-cinque-terre-guide/ ;
  cinqueterre-travel.com. https://cinqueterre-travel.com/destination/vernazza/
- **Corniglia — only village not on the sea, ~100 m up on a rocky promontory ringed by vineyards;
  no harbour, no ferry stop; smallest/quietest; name from Roman Gens Cornelia; to Genoa 1276;
  the Lardarina staircase = 382 zigzag brick steps from the station (shuttle alternative).**
  — cinqueterre-travel.com. https://cinqueterre-travel.com/destination/corniglia/ ;
  kevmrc.com. https://www.kevmrc.com/corniglia-cinque-terre-italy
- **Manarola — perhaps the oldest of the five; San Lorenzo church cornerstone 1338; present
  settlement from late 12th c. (people came down from Volastra); tiny rocky harbour squeezed
  between cliffs, protected by a breakwater (most-photographed spot); terraced "heroic"
  viticulture and Sciacchetrà (appassimento, Bosco grape); Via dell'Amore to Riomaggiore.**
  — Wikipedia, *Manarola*. https://en.wikipedia.org/wiki/Manarola ;
  Cinque Terre Riviera. https://cinqueterreriviera.com/sciacchetra-wine-cinque-terre/
- **Riomaggiore — southernmost ("southern jewel"); early-13th-c. origins, allegiance to Genoa
  1251; V-shaped working harbour; Castello di Riomaggiore begun 1260 (Turcotti), completed under
  Genoa, square plan with round towers; Via dell'Amore (Path of Love) to Manarola, part of the
  Sentiero Azzurro.** — Wikipedia, *Riomaggiore*. https://en.wikipedia.org/wiki/Riomaggiore ;
  Trainline guide. https://www.thetrainline.com/en-us/via/europe/italy/your-guide-to-riomaggiore-the-southernmost-village-of-cinque-terre ;
  viadellamore.info. https://www.viadellamore.info/en/castello-di-riomaggiore ;
  thatsliguria.com. https://thatsliguria.com/en/riomaggiore-where-starts-the-lovers-line/
- **Cinque Terre by boat — seasonal ferry ~28 March–1 November 2026; stops at Monterosso,
  Vernazza, Manarola, Riomaggiore (NOT Corniglia, no harbour); connects La Spezia / Portovenere
  / Levanto; ~09:00–18:00; day passes available, prices/times change yearly.**
  — Arbaspaa 2026 timetable. https://www.arbaspaa.com/blog/cinque-terre-boat-timetable ;
  cinqueterre-travel.com (boat). https://cinqueterre-travel.com/getting_there/boat/
- **Monterosso beaches — only village with substantial sandy beaches; Fegina = largest in the
  Cinque Terre, in front of the station, with paid lidos plus free stretches (Fegina free beach,
  Stazione free beach); Spiaggia del Gigante = larger/quieter free beach toward Levanto beneath
  Il Gigante; small old-town cove by the ferry dock.** — lecinqueterre.org.
  https://www.lecinqueterre.org/eng/beaches/beachesmonterosso.php ;
  La Spezia Guide. https://laspeziaguide.com/insider-guide/everything-cinque-terre/cinque-terre-experiences/cinque-terre-beaches-top-spots-for-sunbathing-and-swimming/
- **Food — pesto (basil, pine nuts, garlic, Parmigiano + Pecorino, sea salt, Ligurian olive oil)
  on trofie, often with potatoes and green beans; focaccia; farinata (chickpea flatbread);
  anchovies called "pan do ma" (bread of the sea), fresh/marinated/fried/salted in arbanelle;
  Cinque Terre DOC white; Sciacchetrà passito.** — The Mediterranean Traveller.
  https://www.themediterraneantraveller.com/cinque-terre-food/ ; Emilia Delizia (above).

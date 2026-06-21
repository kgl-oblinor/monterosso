# 🎨 SPEC — 7 stiler av landingen (samme tekst & flyt, ulikt utseende)

> Kristian: én stil = slik den er i dag (røres ikke). 6 andre = fritt utseende (farge, font, størrelse, knapper, geometri), MEN samme tekst, flyt, funksjon. **Mobil først. SEO sterkt.** Jeg (Krin) QA-er hver: bygg-test, typografi, kritiske spørsmål, små forbedringer, siste gjennomgang, retter selv → commit/push/deploy.

## INVARIANTER (identisk i ALLE 7 — kun utseende endres)
**Tekst (eksakt, uendret):** «Monterosso al Mare» · «Cinque Terre» · «A private sail on the Mar Ligure, aboard the Paolona» · «Come aboard» · «Andiamo» · hub: News · Boat tours · Booking · The captain · Customer service · «Explore» · boat-siden (Included: Aperitivo & cold drinks aboard / A swim & snorkel in a hidden cove / All five villages, from the water / Stories from a local skipper; Ligurian gozzo · ~7 m; Duration; Departures; From) · booking-stegene (How many of you? · Which day? · When · Departure · Meeting point · Guests · Total · Code · Add me to your calendar · Or ask us something first · More dates…) · Customer service (Message us on WhatsApp / We usually reply within an hour / Change a booking / Back to booking).
**Flyt (uendret):** hero → «Come aboard» → kvittering-først booking (~3 tap) → bekreftelse. Hub via «Explore». Landsby-sider. SeaClock øverst t.v. Stil-velger øverst t.h.
**Funksjon (uendret):** booking ender i **WhatsApp** (wa.me, ferdig melding) — primær; **ring** (tel:) + **e-post** (mailto) + **lag konto** (/register på app) som alternativ. Dashboard har samme funksjon. «Skjul alt levende når popup åpnes».
**Krav:** mobil-først (viktigst), SEO bevart (metadata/OG/sitemap/semantikk), kontrast ≥4.5:1, gull-CTA-loven der gull brukes (blekk-tekst + ramme).

## STIL #1 — «I dag» (LÅST, røres ikke)
Azure/aerial-bay-bakgrunn, Limelight display-tittel, cream/gull, script «Come aboard». Default på innlasting.

## 6 NYE STILER (én agent hver — distinkte, gjennomførte)
1. **Editoriale (minimalist)** — *Kristians eksplisitte:* elegant, minimalistisk, **uten ikoner**, rett-frem høflig engelsk, **geometri i verdensklasse**, enorm whitespace, tilbakeholden serif/sans, hårfine linjer, én rolig aksent.
2. **Riviera Déco** — 1930-talls italiensk riviera art déco: geometriske gull-linjer, deco display-font, dyp marine + champagne.
3. **Studio (modern sans)** — sveitsisk/grid, ren bold sans, monokrom + én aksent, stramt rutenett, store mellomrom.
4. **Maritimo (nautisk arv)** — tidløs maritim: marineblå, messing-gull, klassisk serif, rolig og solid.
5. **Cartolina (varm redaksjonell)** — varmt magasin-uttrykk: serif + varme toner, sjenerøs linjeavstand, postkort-følelse.
6. **Notturno (kinomatisk mørk)** — dramatisk høykontrast natt: stor type, dyp blekk, ett gull-glimt, filmatisk ro.

## Arkitektur (kollisjonsfri)
Hver stil = scoped klasse `.landing-v2.style-<key>` i én egen fil `app/landing/styles/<key>.css` som overstyrer **typografi (font/størrelse/spacing), palett, knappe-stil, geometri, bakgrunn**. #1 = ingen klasse (base). Stil-velger (øverst t.h.) bytter klasse, husket i localStorage. Agenter rører KUN sin egen fil; Krin wirer velgeren + tekst/flyt forblir i Landing.js (urørt struktur).

## QA-prosess (Krin per stil)
les → bygg-test (esbuild/next build) → typografi-/typo-sjekk → kritiske spørsmål → be om små justeringer → siste gjennomgang → rett selv → verifiser **mobil** + **kontrast** + at tekst/flyt/funksjon er uendret → commit/push/deploy. Ingen stil «godkjennes» før den sitter.

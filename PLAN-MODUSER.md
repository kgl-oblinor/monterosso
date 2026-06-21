# 🎨 PLAN — Mode-system (landing) · forslag, venter på Kristians godkjenning

> Mål: **6–7 moduser** byttet fra **øverst til høyre**. Hver mode har **sitt eget design** (palett, glass-tint, bakgrunn, farge-kombo, knappe-nyanse) — men **innhold, tekst, lenker, dashboard og flow er like** og matcher sin egen mode. Forankret i RESEARCH-UX.md + RESEARCH-GLASS.md + de globale lovene.

## Arkitektur (kollisjonsfri + ren)
- Mode = klasse `.landing-v2.mode-<key>` på rota.
- **Base** (struktur + tokens + flow) ligger i `landing.css`/`Landing.js` — uendret.
- **Hver mode = én fil** `app/landing/modes/<key>.css` som KUN overstyrer: palett-tokens, bakgrunn, glass-behandling, aksent/knappe-nyanse. → agenter kolliderer aldri (én fil hver).
- **Mode-velger** øverst til høyre: liten diskré kontroll (thumbnails/ikoner), husket i `localStorage`, satt **pre-paint** (ingen blink), med **«auto»** som gjenopptar dag/natt-scenen etter klokka.
- Mode-velgeren **erstatter/forener** dagens separate dag/natt-toggle + bakgrunns-toggle til ÉN kontroll.

## De 7 modusene (forslag)
| # | Mode | Uttrykk | Bakgrunn |
|---|---|---|---|
| 1 | **Light (Dag)** | dagens levende scene, cream/himmel/gull | animert scene |
| 2 | **Dark (Natt)** | stjerne-scene, blekk/gull | animert scene |
| 3 | **Sunset** | rose→rav→terracotta, varm skumring | gradient |
| 4 | **Open Sea** | azur/marine + pale-gull, kjølig elegant | `aerial-deepblue.webp` |
| 5 | **Borgo** | liguriske pasteller (oker/terracotta/rosa) | `village-panorama.webp` |
| 6 | **Azure Bay** | turkis/sand/hvit, lyst og luftig | `aerial-bay.webp` |
| 7 | **Sepia** | vintage postkort, dempet duotone | gradient |

## Likt vs. ulikt
- **LIKT (alle moduser):** sidestruktur, all copy/tekst, lenker, booking-flow, hub, dashboard-layout, de globale lovene (radius 0, 4px, **gull-CTA = blekk-tekst + 1px ramme**, luft ikke linjer, fonter, ÉN aksent).
- **ULIKT per mode:** palett, bakgrunn, glass-tint+blur, farge-kombo, knappe-nyanse (innenfor lovene).

## Flow (likt for ALLE — endrer jeg noe, endrer jeg det for alle)
landing → mode-tilpasset glass → booking åpnes → **alt levende fryser/skjules, kun stille bakgrunn bak glasset** (din regel) → kvittering-først → WhatsApp.

## Glass-regler (fra RESEARCH-GLASS)
Blur ≥40px over foto / ~16px over gradient · fyll 10–40% tonet etter mode · 1px hårstrek · 20–30% tint bak tekst-blokk for ≥4.5:1 · glass på ett lag.

## Prosess (Krin styrer hele teamet)
Én agent per mode → **kritisk review (kontrast, glass, lover, egen karakter)** → tilbakemelding → tilpasning → ny sjekk → **ny research om smartest**. **Kontrast-gate:** verifiser popup over HVER mode før noe godkjennes.

## Rekkefølge
1. Krin bygger mode-scaffolding (velger + `.mode-<key>`-mekanikk + pre-paint + localStorage) + formaliserer light/dark.
2. 5 agenter bygger de 5 nye mode-filene (jeg dirigerer review-loopen).
3. Wire imports + velger → kontrast-gate over alle → build + deploy v2.

## Åpne valg til Kristian
1. **6 eller 7 moduser?** (jeg foreslår 7)
2. **Mode-settet/navnene** over — beholde, eller bytte ut noen? Ønsker du en spesifikk stemning (f.eks. «Storm/Maestrale» i stedet for Sepia)?
3. **Velger-stil** øverst til høyre: ikon-rad · liten dropdown · thumbnail-popover?
4. Bekreft at mode-velgeren **forener** dagens dag/natt + bakgrunns-toggle til én kontroll.

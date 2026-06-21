# POLISH-DESIGN — design-audit mot fasiten (MÅL.md + COORDINATION.md)

Auditør: DESIGN. Dato: 2026-06-21. **Ingen kode endret** — kun liste.
Format: `- [P1|P2|P3] fil:linje — problem → konkret fiks`

Hovedfunn: **landingen** følger systemet godt (SYM har ryddet symmetrien). Det
store gapet er **SEO-sidene (content.css)** og **admin/kaptein (globals.css)** —
to parallelle design-univers som IKKE deler tokens, bryter «luft ikke linjer»,
har avrundede hjørner og off-grid px. De drar ned «likt overalt»-prinsippet.

---

## P1 — bryter en eksplisitt global LOV (skal fikses først)

- [P1] app/(content)/content.css:93,131,198,40,168 — SEO-sidene er bygget på **divider-linjer** (`border-top: 1px solid var(--c-line)` mellom hver section + nav + footer + grid). COORDINATION sier «Separasjon med LUFT, ikke linjer: ingen divider-borders; bruk margin/gap». → fjern alle `border-top/border-bottom: 1px solid var(--c-line)`; erstatt seksjons-skille med `padding: var(--s7) 0` / luft (48–64px). Behold kun `content__fact` sin venstre-strek hvis ønsket (men helst luft).
- [P1] app/(content)/content.css:9-16 — egen palett som **avviker fra fasiten**: `--c-ink: #20140c` (skal være blekk `#07182a`), `--c-sea: #115f79` / `--c-sea-deep: #06304a` (sjø-blå finnes ikke i paletten — fasit er blekk/cream/gull/terracotta). Lenker blir blå i stedet for terracotta/gull. → bytt link/aksent-farge til `--terracotta (#a8743f)` eller `--gold`; sett ink = `#07182a`; dropp `--c-sea*`.
- [P1] app/(content)/content.css:8-25 — content-sidene definerer **egne `--c-*`-tokens** i stedet for å gjenbruke fasit-skalaen (spacing `--s1..--s8`, type `--t-*`, `--ls-*`). Hele filen bruker rå px (se P1 under). → innfør samme token-blokk som landing.css topp (4px-skala, 1.2 type, ls-tokens) og referer tokens i stedet for rå tall.
- [P1] app/(content)/content.css (hele filen) — **ingen 4px-rytme**: 13/18/19/15/17/22/38/56/52/34/36px er off-grid (skal være multiplum av 4). Eks: linje 88 `font-size:13px`→`--t-sm 13px` (ok-verdi, men via token), 108 `18px`, 114 `18px`, 39 `padding 24px 0 20px` (20 ok men 24→`--s5`), 61 `56px 0 8px`, 89 `24px 0 0`. → map alle til `--s*` (4,8,12,16,24,32,48,64) og `--t-*`; 18px-body→`--t-base 16px` eller behold som bevisst 16/19.
- [P1] app/globals.css:1697,1783,1789,1743 — **admin/kaptein har avrundede hjørner** (`border-radius: 18px` kort, `12px` input/knapp, `20px` chip). Fasit: radius 0 på alt rektangulært, kun avatar/toggle runde. → sett radius 0 på `.admin-card`, `.admin-login input`, `.admin-login button`, `.chan`.
- [P1] app/globals.css:1729,1733 — admin-tabell bruker **divider-linjer** (`border-bottom: 1px solid` på th/td). Bryter «luft ikke linjer». → fjern radstrekene; bruk rad-padding/`gap` eller en svært subtil annenhver-rad bakgrunn i stedet.

## P2 — system-konsistens / token-bruk / farge

- [P2] app/(content)/content.css:138-151 — SEO-CTA («content__cta-link») er en **transparent ramme med Limelight**, mens fasit-primær-CTA er en solid gull-«ticket» (jf. `.vp-cta`/`.pay` i landing). To ulike CTA-språk på samme produkt. → gi SEO-CTA samme gull-fyll + skarp ticket-ramme som landingens primær-CTA (eller bevisst «quiet»-variant, men da likt definert i tokens).
- [P2] app/globals.css:1748-1758 — admin-chip-farger (`#8ef0b0` grønn, `#aad0ff` blå) er **utenfor paletten** (blekk/cream/gull/terracotta). → bytt til palett-toner: gull for call, terracotta for whatsapp/sms, eller én nøytral ink-chip; behold kun semantisk forskjell via tekst.
- [P2] app/globals.css:1675,1676,1683,1687,1696,1728,1732,1771,1784 — admin **off-grid px** (28,38,14,22,24,6,10,12,13,15 px) + `letter-spacing: 0.24em/0.16em/0.02em` hardkodet i stedet for `--ls-1/2/3`. → map til 4px-skala og ls-tokens (`.14`/`.08`/`.02`).
- [P2] app/(content)/content.css:46,54,80,113 — hardkodet letter-spacing `0.16em / 0.12em / 0.08em / 0.18em / 0.01em` i stedet for token-skalaen (`--ls-1 .02 / --ls-2 .08 / --ls-3 .14`). 0.16/0.12/0.18 finnes ikke i skalaen. → snap til `--ls-2 (.08)` / `--ls-3 (.14)`.
- [P2] app/(content)/content.css:163-170 — `content__grid` bruker `gap:1px; background:var(--c-line); border:1px solid` for å lage **rutenett-linjer mellom kort** — nok en divider-linje-løsning. → bruk ekte `gap: var(--s4)` mellom kort, ingen linje-bakgrunn (luft, ikke streker).
- [P2] app/(content)/content.css:62-68 — `content__eyebrow` bruker Great Vibes i sjø-blå `--c-sea`; landingens script-lenker (Great Vibes) er gull/blekk. Farge-inkonsistens script ↔ landing. → eyebrow i `--gold` eller terracotta, ikke blå.

## P3 — finpuss / mindre avvik

- [P3] app/landing/landing.css:1064 (`bottom: 5px`), :1080 (`right: -4px`), :1081-relatert :1077 (`top: -8px`), :1713 (`top: -15px`), :900 (`right: 17px`), :910/916 (`translateY(-65%/-45%)`) — små optiske nudge-verdier utenfor 4px-rytmen. Mest bevisst piksel-justering, men 17px/15px/8px/5px kunne snappes til 16/16/8/4 der det ikke bryter optikken. → vurder å snappe der det ikke endrer det optiske resultatet; ellers behold med kommentar.
- [P3] app/landing/landing.css:194-200 — `.woodsign-text` bruker **«Hanken Grotesk»** + `letter-spacing: 1.5px` + `font-size: 24px` (rå px). Det er SVG-tekst på treskilt (whimsy-element), men bryter font-regelen «aldri annet enn Fraunces/Limelight/Great Vibes» og bruker rå spacing. → vurder Fraunces 800 for skiltteksten, eller behold bevisst som «carved» og dokumentér unntaket i COORDINATION. ls→token om beholdt.
- [P3] app/landing/landing.css:198 — `letter-spacing: 1.5px` (px, ikke em/token) på woodsign-text. → `--ls-3` (.14em) eller em-verdi hvis skiltet beholdes.
- [P3] app/(content)/content.css:23 — `min-height: 100vh` (samme svh-problem som landingen løste i :1137). På mobil Safari kan footer havne under adresselinja. → bruk `100svh` med `100vh`-fallback, som landingen.
- [P3] app/(content)/content.css:108,114 body 18px vs landing `--t-base 16px` — SEO-brødtekst er 18px, landing 16px. Bevisst (lesbar long-form), men ikke samme type-skala. → enten dokumentér som SEO-lese-skala, eller juster til `--t-md 19px` for å treffe 1.2-skalaen i stedet for off-skala 18.
- [P3] app/(content)/content.css:9 vs globals.css:8 — content `--c-cream: #f7f1e3` (popup-cream, korrekt fasit) men globals `--cream: #fdf6ea` (lysere ivory). To «cream»-er i bruk. Fasit-popup er #f7f1e3 → korrekt på SEO; men sjekk at den lyse `--cream` på landing-tekst-på-mørk er bevisst. Ingen endring nødvendig, kun verifiser.
- [P3] app/landing/landing.css:1273 — popup-kort har `border: 1px solid rgba(255,255,255,0.6)` (lys hårstrek-kant). Mild, men teknisk en linje på en flate som skal være «solid cream, ingen streker». → vurder å fjerne for ren flate, eller behold som subtil rim (dokumentert).

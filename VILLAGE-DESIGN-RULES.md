# 🎨 GLOBALE REGLER — karikaturer av de 5 Cinque Terre-byene

Alle 5 by-agentene følger DISSE reglene, så de fem henger sammen som ÉN scene (paper-cut), men hver by blir en vivid, gjenkjennelig KARIKATUR. Hver agent rører KUN sin egen fil i `cinque-terre/app/landing/villages/<By>.js`.

## Hva en karikatur betyr her
- **Behold paper-cut-stilen** (flate SVG-former, ingen fotorealisme).
- **Overdriv fargene** — mer mettet, dristigere pastell enn i dag.
- **Forstørr/forsterk det ÉNE ikoniske bygget/trekket** for byen din (se din brief) så byen gjenkjennes umiddelbart.
- Resten av byen er rolig bakgrunn for det ikoniske.

## Felles tegne-konvensjoner (IKKE bryt — det er disse som binder de 5 sammen)
- **Koordinatsystem:** hver by tegnes i `<g transform="translate(X,0)">` (BEHOLD din X: Monterosso 20 · Vernazza 330 · Corniglia 600 · Manarola 880 · Riomaggiore 1150). Bakken ligger ~y=260, byggene strekker seg oppover (mindre y = høyere). **Ikke endre translate-X eller den totale bredden/fotavtrykket** — da forskyves scenen.
- **Delte defs (BRUK, ikke redefiner — de finnes i Skyline.js):** `#cypress`, `#bush`, `fill="url(#hillGrad)"` (åser), `fill="url(#rockGrad)"` (klipper), `fill="url(#mtnGreen)"` (grønt vegetasjons-slør nederst).
- **CSS-variabler (bruk):** `var(--win)` (vinduer), `--veg-green`, `--hill-top/--hill-bot`, `--rock-top/--rock-bot`, `--cypress`, `--bush`, `--terrace/--terrace2`.
- **Hus-oppskrift:** farget rect (vegg) + en **4px mørkere takstripe** på toppkanten + små `var(--win)`-vinduer + en **høyre-kant skygge-rect** (`fill="#000000" opacity="0.12"`) for dybde + mørke dør-rects. Behold denne for ekte Cinque Terre-følelse (høye, smale, tett stablede pastellhus med flere vinduer).
- **Avslutt** byen med `<rect ... fill="url(#mtnGreen)">`-sløret + en sand-/jord-path nederst (som i dag), så byen sitter i scenen.
- Komponenten returnerer et fragment: `return (<> … <g transform="translate(X,0)"> … </g> </>);`

## Palett å overdrive (eksisterende varme liguriske hexer — gjør dem dristigere)
`#d8443a` (rød) · `#e3793a` (oransje) · `#e89a4e` · `#ecc15a`/`#ecc164` (gul) · `#dd7a86`/`#d98a86` (rosa) · `#e58a6e` (fersken) · `#e3a35c` (oker). Tak/skygge: `#a9482f`/`#8c3b2a`. Stein: `#8a8478`/`#76705f`.

## Krav
- Mobil-først (scenen skaleres). Behold lesbarhet/kontrast mot himmel + sjø.
- Hold deg i DIN fil. Ikke rør Skyline.js, Landing.js, landing.css, andre byer, eller cinque-terre/ ellers. Ikke git.
- Verifiser at fila parser (esbuild med jsx-loader).

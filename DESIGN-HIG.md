# DESIGN-HIG — vår Apple-mal (Monterosso · Cinque Terre)

> Syntetisert referanse basert på **Apple Human Interface Guidelines (HIG)** — Apples faktiske
> regler + verdier, gjengitt i våre ord og tilpasset vårt web-prosjekt (hvit + frosta glass + tynn gull + SF Pro).
> Dette er **malen** vi måler alle sidene mot. Ikke en ordrett kopi av HIG.
>
> Kilder (hentet 2026-07-01, developer.apple.com/design/human-interface-guidelines/):
> `typography` · `layout` · `color` · `materials` · `buttons` · `icons` · `designing-for-visionos`

---

## 0. Kjerneprinsipper (Foundations)
Apple bygger på **klarhet, deferanse (innhold først), dybde**. Konkret:
- **Grupper det som hører sammen** med luft, materialer eller hårfine skiller — ikke bokser overalt.
- **Prioriter det viktigste**; ikke skjul det bak pynt.
- **Hierarki via plassering**: viktigst nær toppen og på ledende side.
- **Juster for skanning**: linjer opp, konsistent rytme.
- **Progressiv avdekking**: vis at det finnes mer, ikke dump alt.

---

## 1. Typografi
- **Systemfont SF Pro** (`-apple-system, BlinkMacSystemFont, "SF Pro Text/Display", system-ui`).
- **Unngå lette vekter** (Ultralight/Thin/Light). Bruk **Regular (400) / Medium (500) / Semibold (600) / Bold (700)**.
- **Minimér font-variasjon** — for mange typesnitt bryter hierarkiet.
- **Hierarki via vekt + størrelse + farge**, ikke via mange snitt.
- **Leselige størrelser**; komfortabel leading; **ikke for tett leading** på 3+ linjer.
- Apples referanse-defaults (kontekst): iOS 17pt/min 11 · macOS 13/10 · visionOS 17/12.
- På glass/visionOS: **maks kontrast** tekst mot underlag; foretrekk «2D»-tekst.

**Vår regel:** display-tittel Bold + negativt tracking; ingressen ≥ Regular (aldri under 400); brødtekst ~17px, line-height ~1.5–1.6; mørk ink på hvitt = sterk kontrast ✓.

---

## 2. Layout & spacing
- **Grupper med negativt rom**; viktig innhold nær topp + ledende side.
- **Minste treffområde 44×44 pt** (60×60 i visionOS) — knapper/lenker/tap-mål.
- **Respekter marger / lesbar bredde**; ikke bruk full-bredde-knapper uten grunn.
- **Adaptivt**: ulike størrelser/orientering, Dynamic Type, RTL.
- **Sentrer det viktigste** (visionOS-vinduer); interaktive sentre ≥ 60 pt fra hverandre.

**Vår regel:** hero-innhold sentrert, lesbar maks-bredde (~720–760px); alle knapper/lenker ≥ 44px høyde/treff; 4/8px-basert spacing-rytme.

---

## 3. Farge
- **Bruk farge målrettet og sparsomt** — særlig **på glass**.
- **Legg farge på bakgrunn, ikke på tekst/symbol** for primærknapper.
- **Konsistens**: ikke samme farge for ulike betydninger (f.eks. ikke merkefarge på både knapp og pyntetekst).
- **Tilgjengelighet**: nok kontrast; **aldri farge alene** som informasjonsbærer; støtt lys/mørk/økt kontrast.
- På glass/visionOS: farge helst i **bold tekst og store flater** (små flater blir vanskelige).

**Vår regel:** oransje lever (om vi tar den inn igjen) kun i bakgrunn, aldri i tekst/mush. **Gull = dempet aksent** (eyebrows, lenker, tynne streker) — ikke tung ramme rundt alt (HIG: farge sparsomt). Ink `#2A1810` på hvit = OK.

---

## 4. Materialer / glass  ← viktigst for oss
- **Glass/materialer er for den FUNKSJONELLE laget** — kontroller, navigasjon, «sheets» som svever *over* innhold. **IKKE i innholdslaget.**
  - → Dette bekrefter fiksen vår: **tekstsider skal være rene** (ingen glass-kort bak brødtekst); glass forbeholdes booking-veiviser, popups (sheets) og nav.
- **Varianter:** *regular* (blurrer bakgrunn, bedre lesbarhet — bruk når bakgrunn kan skade lesbarhet eller mye tekst) vs *clear* (svært transparent, for media — dim ~35% over lyst innhold).
- **Standard-materialer:** ultraThin / thin / regular / thick (økende opasitet).
- **Bruk vibrante (system-)farger på materialer** for kontrast; unngå lav-kontrast tekst på tynne materialer.
- **Ikke overbruk glass** — bruk sparsomt; standardkomponenter håndterer det selv.
- visionOS: **foretrekk translucens over opasitet**; glass tilpasser seg lys.

**Vår regel:** frosta glass = booking-sheet + popups + (ev.) nav. Tekstsider = rent hvitt. Glass trenger noe *bak seg* for å leve (derfor scene/foto/blobs bak, ikke flatt).

---

## 5. Knapper
- Én **umiddelbar handling**. Min treff **44×44** (60 visionOS).
- **Roller:** normal / **primary** (mest sannsynlige valg, aksentfarge) / cancel / **destructive** (system-rød). **Aldri primary på destruktivt**.
- **Maks 1–2 prominente knapper per skjerm.**
- **Skill valg med STIL, ikke størrelse.** Lik størrelse = sammenhengende sett.
- **Etikett:** få ord, **Title Case**, start med verb; **etterstilt ellipse (…)** hvis den åpner en ny visning.
- **Alltid press-state** på egendefinerte knapper.
- **Form:** capsule/pill for tekst, sirkel for kun-ikon.
- **Legg farge på bakgrunn, ikke etikett**; monokrom etikett.

**Vår regel:** «Come aboard» / «Check availability» = **primær ink-pill**, én per skjerm, verb-etikett, press-state, ≥44px. «Log in», bysider osv. = rolige tekstlenker (sekundært).

---

## 6. Ikoner
- **Enkle, gjenkjennelige**, ett konsept. **Konsistent strek-vekt**; match vekt til nabotekst.
- **Optisk sentrering** (geometrisk senter ser ofte skjevt ut).
- **Foretrekk SF Symbols**; **vektor (SVG/PDF)**, ikke PNG.
- **Tilgjengelighet**: alt-tekst/beskrivelse for egendefinerte ikoner.

---

## 7. Sjekkliste — mål hver side mot dette
- [ ] SF Pro overalt; ingen vekt under Regular (400)
- [ ] Hierarki via vekt/størrelse/farge; få typesnitt
- [ ] Brødtekst ~17px, line-height ~1.5–1.6; ikke for tett
- [ ] Alle tap-mål ≥ 44px
- [ ] Lesbar maks-bredde; viktig innhold nær topp
- [ ] **Glass KUN i funksjonelt lag** (sheets/popups/nav) — tekstsider rene hvite
- [ ] Glass har noe bak seg å frostе; nok kontrast på materialet
- [ ] Farge sparsomt; gull = dempet aksent, ikke ramme rundt alt
- [ ] Kontrast OK i lys modus; ikke farge alene som info
- [ ] Maks 1–2 prominente knapper/skjerm; primær = ink-pill, verb, press-state
- [ ] Ikoner: SF Symbols/vektor, konsistent vekt, alt-tekst

---

## 8. Kjente spenninger å ta stilling til
1. **«Tynn gull-kant på ALT»** vs HIG «bruk farge sparsomt, særlig på glass». Vurder å begrense gull til aksenter (eyebrows/lenker/utvalgt-ring) framfor hver kant.
2. **Frosta glass på tekstsider** var mot HIG (glass = funksjonelt lag) — allerede rettet: tekstsider er rene.
3. **Ekstremt glass på flatt hvitt** viser lite (glass trenger tekstur bak) — derfor booking-sheet over scene/foto, ikke over blankt.

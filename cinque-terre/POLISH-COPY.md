# POLISH-COPY — tekstrevisjon (copy-audit)

Auditør: COPY-auditøren. Dato: 2026-06-21.
Vurdert mot MÅL.md: varm men stram tone · rolige fremover-verb (Continue/Explore, aldri hype/utrop) · korrekt engelsk · konsistens · sannhet · klarhet for eldre, ikke-teknisk leser.
**Ingen kode er endret.** Dette er kun forslag, prioritert.

Format: `- [P1|P2|P3] fil:linje — «nåværende» → «foreslått» (begrunnelse)`

---

## P1 — feil, falsk fakta, eller pinlig

- [P1] app/landing/villageData.js:42 og :48 vs app/(content)/cinque-terre/corniglia/page.js:7,16,80,82,141 — «377 steps (the Lardarina)» (landing) → «382 steps» (motstridende tall i samme prosjekt: SEO-siden sier konsekvent 382, landing sier 377). Velg ÉTT tall og bruk det overalt. Kilden (kevmrc) i SEO-fotnoten oppgir 382, så landing bør rettes til 382.
- [P1] app/landing/Landing.js:503 — «Kristian Løkken» (kaptein-navn) → et nøytralt/ekte skippernavn, ELLER fjern egennavnet (f.eks. «Your skipper»). Begrunnelse: dette ser ut som en plassholder (Kristian = norsk plattform-admin, ikke pilotskipperen Andrea), og det kolliderer med den faktiske påstanden rett under: «Born to this shore» / «born and raised on this shore» — en Ligurisk lokal kan ikke hete «Kristian Løkken». Falsk/selvmotsigende fakta for en eldre leser som tar det bokstavelig. (Booking-meldingen bruker bevisst nøytralt navn — kaptein-siden bør være konsistent.)
- [P1] app/landing/Landing.js:1465 — label «Day after» (dato-velger) → «Day after tomorrow» (eller bare datoen). «Day after» alene er ikke korrekt/komplett engelsk og er uklart for en eldre, ikke-teknisk leser. Hvis plassen er trang, bruk «In 2 days».
- [P1] app/landing/Landing.js:811, :1057, :1095, :1140, :1179, :1223 — tomme `box-count`/overskrift-felt (linjer med kun whitespace der en overskrift forventes; jf. step «receipt» som HAR «Your place» på :1000). Flere steg-popups mangler en kort overskrift øverst der mønsteret ellers har én. Begrunnelse: inkonsistent og kan se ufullført ut. Legg en rolig overskrift på hvert steg (f.eks. «When», «Who's coming», «What time»), eller fjern det tomme elementet bevisst overalt. (Verifiser i nettleser — kan være tomt med vilje.)

## P2 — inkonsistens (samme begrep brukt ulikt)

- [P2] app/landing/Landing.js:953–956 (done-skjerm) vs :816–842 (sent-skjerm) — done-skjermen viser «{when} · {slotLabel} · {guests} guests · ${total}» uten «Meeting point», mens kvitteringen og bekreftelsen viser møtepunkt. Vurder å vise møtepunkt likt i alle oppsummeringer, så detaljene er identiske gjennom flyten.
- [P2] app/landing/Landing.js:1437 vs hele booking-flyten — booking-WhatsApp-meldingen sier «for {N} people», mens UI ellers konsekvent bruker «guest(s)». Bruk «guests» også i meldingen for konsistent begrepsbruk («…for 2 guests»).
- [P2] lib/tour.js:5 vs app/landing/Landing.js:507–511 / :331–338 — beskrivelsen i tour.js sier «a skipper who's yours alone», kaptein/boat-sidene sier «he is yours alone for the day». Samme idé, lett ulik formulering — greit, men hold «yours alone for the day» som standardformen hvis du vil ha eksakt konsistens.
- [P2] app/landing/Landing.js:363 — boat-faktaboks «Departures: sunrise · sunshine · sunset» (tre) vs lib/tour.js:10-kommentar «The two daily departures». Kommentaren er ikke brukervendt, men avslører at tekst og data er ute av takt: tre slots finnes. Ikke en streng-feil i seg selv, men bekreft at «three departures» er sannheten overalt (det er det brukeren ser).
- [P2] lib/tour.js:13–15 — slots «sunshine 09:00–18:00» og «sunset 14:00–20:00» overlapper (14:00–18:00 dekkes av begge). Brukeren ser disse vinduene i tid-steget (Landing.js:1157). Vurder ikke-overlappende vinduer (f.eks. sunshine 10:00–14:00, sunset 17:00–20:00) for klarhet — ellers virker «Sunshine» og «Sunset» som samme tur midt på dagen.
- [P2] app/landing/Landing.js:1058 «Where shall we meet you?» + :1072 «we'll come to you» vs kvittering «Meeting point: Molo dei Pescatori» (:1022) — pickup-steget lover henting i alle fem landsbyer, men kvitteringen hardkoder «Molo dei Pescatori» uavhengig av valgt sted (`pickup` brukes i sent-skjermen, men ikke i receipt-oppsummeringen :1020-1023). Inkonsistent møtepunkt mellom steg. (Grenser til P1 hvis kunden faktisk velger en annen landsby — da viser kvitteringen feil sted.)

## P3 — finpuss (tone, rytme, småord)

- [P3] app/landing/Landing.js:21 — WA-alt «We're a group of 4 — what's the price for a private tour?» → «We are four — what is the price for a private tour?» (varm men stram; unngå sammentrekninger der resten av sidene bruker full form, f.eks. «We are here to help»). Mindre viktig; behold sammentrekninger hvis det er bevisst valgt tonefall.
- [P3] app/landing/Landing.js:1001–1003 — «We've saved two seats on the next sailing. Change anything, then continue.» → «We have set aside two seats on the next sailing. Change anything you like, then continue.» («saved» kan misforstås som «lagret»; «set aside» er varmere og tydeligere for eldre leser).
- [P3] app/landing/Landing.js:951 — «One tap and we'll pick it up on WhatsApp — your message is ready.» → «One tap, and we will pick it up on WhatsApp — your message is ready.» (komma + full form for rolig rytme; «tap» er teknisk — vurder «One tap» beholdt da hele siden bruker «tap», men ellers «One tap, and …»).
- [P3] app/landing/Landing.js:1057-tom + :1058 «Where shall we meet you?» — fint og varmt; behold. (kun notert som god referansetone.)
- [P3] app/landing/Landing.js:1193 «we shall be ready to help» → «we will be ready to help» («shall» i 1. person flertall er korrekt britisk, men «will» er enklere/varmere og matcher «we will sort it» (:662) og «we will be in touch». Konsistens-finpuss.)
- [P3] app/landing/Landing.js:1402 (alert) «Link copied — send it to a friend.» → behold; men `alert()` er brå for en eldre bruker. Vurder en rolig inline-melding i stedet (UX-notat, ikke ren copy).
- [P3] app/landing/Landing.js:1390 / :1393 — «Cinque Terre sea tour» (share title) vs siteName ellers «Monterosso · Cinque Terre». Vurder «Monterosso · Cinque Terre sea tour» for konsistent merkenavn i delt lenke.
- [P3] app/landing/Landing.js:382, :530, :592, VillagePage.js:81 — knappen «Explore» med pil er konsistent og rolig — bra, i tråd med MÅL. (Bekreftet, ingen endring.)
- [P3] app/landing/Landing.js:234, :381, :528 — «Come aboard» / «Aboard the Paolona» CTA-er er varme fremover-verb uten hype — bra, behold.
- [P3] app/(content)/cinque-terre/riomaggiore/page.js:71 «swore allegiance to the Republic of Genoa» vs fotnote :140 «allegiance to Genoa in 1251» — konsistent; behold. (Bekreftet sannhet med kilde.)
- [P3] app/(content)/guide/page.js:118–126 — «From west to south they run …» beskriver rekkefølgen korrekt (Monterosso vestligst, Riomaggiore sørligst). Bra. (Bekreftet.)
- [P3] app/landing/villageData.js:11 «a fourteen-metre Neptune carved into the cliff in 1910» vs SEO monterosso/page.js:97 «built around 1910 in reinforced concrete» / beaches:94 «built around 1910» — landing sier «carved … in 1910» (presist år) mens SEO sier «around 1910» og «reinforced concrete» (ikke «carved»). «Carved into the cliff» er upresist (det er armert betong, ikke hugget i klippe) og året bør være «around 1910» for å matche kildene. Grenser til P2/sannhet; rett landing til «a fourteen-metre Neptune, built around 1910».
- [P3] lib/tour.js:5 «a skipper who's yours alone» — sammentrekning i ellers stram beskrivelse; → «a skipper who is yours alone». Finpuss.
- [P3] app/(content)/monterosso/page.js:7 (meta description) «the best anchovies in Liguria» → «celebrated anchovies» e.l. «the best» er en ubevislig superlativ (jf. MÅL: ingen falske påstander). Mild, men en udokumentert superlativ i metadata.

---

## Oppsummering

- **P1:** 4 funn
- **P2:** 6 funn
- **P3:** 13 funn (flere er bekreftelser/«behold» — reelle endringsforslag: ca. 8)

### De 5 viktigste

1. **Corniglia-trapp: 377 vs 382 steg** (villageData.js vs SEO corniglia) — motstridende fakta i samme prosjekt. Rett landing til 382.
2. **Kaptein «Kristian Løkken»** (Landing.js:503) — plassholder-navn som motsier «born and raised on this shore» (Ligurisk lokal). Bytt til nøytralt/ekte skippernavn eller fjern egennavnet.
3. **«Day after» dato-label** (Landing.js:1465) — ufullstendig engelsk og uklart for eldre leser → «Day after tomorrow».
4. **Møtepunkt-inkonsistens** (Landing.js:1020-1023 vs pickup-steget) — kvitteringen hardkoder «Molo dei Pescatori» selv om kunden kan velge annen landsby; kan vise feil sted.
5. **Tomme overskrifts-felt i flere booking-steg** (Landing.js:1057, 1095, 1140, 1179, 1223) — inkonsistent med «Your place»-mønsteret; ser ufullført ut. Verifiser i nettleser.

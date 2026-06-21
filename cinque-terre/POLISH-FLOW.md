# POLISH-FLOW — booking-reisen (FLOW/UX-audit)

> Auditør-lane: leser, endrer ikke. Prioritert liste til LAND (eier av `app/landing/**` + `landing.css`).
> Format: `- [P1|P2|P3] fil:linje — problem/risiko → forslag`
> Nordstjerne (MÅL.md): ~3 tap, kvittering-FØRST, WhatsApp = prioritet 1, aldri «BESTILL NÅ!», rolig guiding.

## P1 — ekte risiko / blokkerer målet

- [P1] lib/tour.js:24 + Landing.js:635,651 — WhatsApp-nummeret er fortsatt plassholder (`4793008600` = Kristians norske nr, TODO i koden). Hele «bestill båtbillett»-flyten (prioritet 1) og Customer service sender kunden til feil/uekte WhatsApp. → Bytt til Andrea (Paolona) sitt ekte WhatsApp-nummer FØR live. Dette er den eneste tingen som faktisk kan ødelegge en booking.

- [P1] Landing.js:719-734 — gjettet bygger på nettleserens lokale tid (kundens tidssone), ikke Europe/Rome. En turist som åpner siden i USA/Asia får feil «neste avgang» (kan gjette sunset når det er natt i Monterosso, eller motsatt). → Beregn `now`/`t` i Europe/Rome (samme tz som kalender-hjelperne, `CAL_TZ`), ikke `now.getHours()` lokalt.

- [P1] Landing.js:719-731 — gjette-vinduene matcher ikke slot-vinduene i tour.js. Slots: sunrise 07–09, sunshine 09–18, sunset 14–20. Gjettelogikken bruker `t = nå+4t`: t<9→sunrise, t<14→sunshine, ellers sunset. Eksempel kl 06: t=10 → «sunshine», men sunrise (07–09) er den faktiske neste avgangen. Kl 04 → t=8 → sunrise som allerede kan være ugyldig. → Gjett ut fra hvilken slot som faktisk har neste gjenstående starttid i Rome-tid, ikke en løs +4t-heuristikk. «Riktig avgang for tid på døgnet» er kjernen i kvittering-først.

- [P1] Landing.js:1000-1031 (receipt) — kvitteringen sier «two seats on the next sailing» og viser slot-label, men gjettet kan peke på en avgang som er passert i dag (se over) eller på «sunset» som default selv når sunshine er nærmere. Eldre kunde stoler på gjettet og trykker Continue → feil avgang booket. → Etter at tz/slot-gjettet er fikset, sørg for at `slotLabel` + `when` i receipt alltid er en framtidig, gyldig avgang.

## P2 — forvirring / tap-telling / inkonsistens

- [P2] Landing.js:707,759-783,793-805,1046-1218 — DØD/INKONSISTENT STEG-MASKIN. `step` kan være `pickup` og `aboard` (egne render-grener finnes, 1046-1089 og 1175-1218), men ingenting setter `step` til disse i normal flyt. `boxNum` (793-805) refererer pickup/aboard «av 8», men telleren rendres ikke lenger. `boarding`/`pickup` samles aldri inn i UI, men vises i bekreftelsen (843-848, 826-828) og sendes til backend (911-916). → Bestem: enten fjern pickup/aboard-grenene + boxNum helt (enklest, matcher ~3 tap), eller koble dem inn bevisst. Nå er det forvirrende død kode som lett gir feil ved senere endringer.

- [P2] Landing.js:760-778 (piltaster) vs 1131-1173 (time) / 1092-1128 (guests) / 1220-1277 (date) — STEG-REKKEFØLGEN ER MOTSTRIDENDE. Piltast-høyre går receipt→time→guests→date. Men «Continue»-knappene går time→guests (1161), guests→date (1112), date→`nextFromDate`→receipt (736-743). «Back» fra date går til guests (1267-1270), fra guests til time (1118-1121), fra time til receipt (1167). Tiles auto-advancer også (time→guests 1152, guests→date 1106, date→receipt 745-748). Resultat: tre ulike «neste»-mekanismer som ikke er helt like, og brief-rekkefølgen «Change the time → tid → gjester → dag → tilbake» stemmer kun delvis. → Gjør ÉN kanonisk rekkefølge og la piltast + Continue + tile-auto-advance følge den likt.

- [P2] Landing.js:763-769 — TAP-TELLING for å ENDRE noe er ikke ~3, den er lang. Happy path (godta gjett) = 2 tap (Come aboard → Continue → [WhatsApp på done]). Men vil kunden endre tid: Change the time → velg tid (auto→guests) → velg gjester (auto→date) → velg dag (auto→receipt) → Continue → Book on WhatsApp = 6+ tap, og kunden TVINGES gjennom gjester+dag selv om de bare ville endre tiden. → La «Change the time» (og hvert steg) returnere rett til receipt etter ett valg, i stedet for å kjede kunden gjennom alle steg. Endre én ting = 2 tap, ikke 5.

- [P2] Landing.js:1029-1031 vs 1112,1161,1206,1261 — KNAPPETEKST-INKONSISTENS. Receipt har «Continue →» (med pil), de andre stegene «Continue» (uten pil). Brief sier rolig «Continue». → Velg én form globalt (anbefaler «Continue» uten pil overalt, eller pil overalt — ikke blandet).

- [P2] Landing.js:736-748,750-757 — DØDE FUNKSJONER `nextFromDate` setter alltid `step="receipt"` og `review()` setter `done=true`. `review()` kalles bare fra `aboard`-grenen (1189,1199,1206) som aldri nås. `error`/`err`-feltet (1274) kan i praksis aldri trigge fordi `date` alltid forhåndsutfylles (733) og hver tile setter date. → Rydd: hvis aboard fjernes, fjern `review()`; vurder å fjerne `error`-stien hvis den er uoppnåelig (eller behold som sikkerhetsnett, men da bevisst).

- [P2] Landing.js:1132,1294-1297 — sunshine OG sunset koster begge $100/guest (multiplier 1), sunrise $150 (1.5). I time-steget vises «$150/guest» kun på sunrise, men de tre tiles ser ellers like ut prismessig. Eldre kunde kan bli forvirret over at to avganger har samme pris og én er dyrere uten forklaring. → Liten hjelpetekst på sunrise («early start») eller fjern pris-per-tile og vis bare totalen som oppdateres. Sjekk at dette er bevisst prising fra Andrea.

- [P2] Landing.js:786,1284-1287 — `code` (MT-DDMMYY-guests) genereres FØR kunden faktisk bekrefter, og to ulike kunder samme dag med samme antall gjester får IDENTISK kode. Koden brukes til «change a booking» (660-663) og admin-oppslag. → Legg til en kort tilfeldig suffiks (f.eks. MT-210625-2-K7) så koder er unike. Ikke kritisk for selve flyten, men blir et problem for skipper-innboksen.

## P3 — finpuss / kosmetikk / robusthet

- [P3] Landing.js:808-811,949,997 — tomme/usynlige linjer (`<p className="box-count">Your place</p>` finnes på receipt, men de andre stegene har en blank linje der box-count pleide å stå, 1057,1095,1140,1179,1223). Asymmetri i toppen av kortene. → Gi hvert steg konsistent topp (enten alle med en liten «Your place / Step»-label eller ingen).

- [P3] Landing.js:925-931 — `window.open(bookingWa, "_blank")` kan blokkeres av popup-blokkere på mobil når den ikke kalles helt synkront i klikk (her er den synkron, men `saveLead()` med sendBeacon kjøres først — ok). Likevel: hvis WhatsApp ikke åpner, går kunden rett til `sent`-skjermen som sier «send the message we opened for you» uten at noe åpnet. → Vurder å la `sent`-skjermen ha en synlig «Open WhatsApp again»-lenke (bookingWa) som fallback.

- [P3] Landing.js:707,711,712,713 — `boarding`, `pickup` default-verdier («no», «Monterosso») samles aldri inn men sendes til backend og vises i bekreftelsen. Bekreftelsen viser «Meeting point: Monterosso» (826-828) selv om kunden aldri valgte det. For en kunde fra Vernazza er dette feil info. → Hvis pickup-steget er ute av flyten, ikke vis «Meeting point» som om kunden bekreftet det; receipt viser allerede hardkodet «Molo dei Pescatori» (1022) — vær konsistent (receipt sier Molo, bekreftelse sier `pickup`-staten = Monterosso; to ulike formuleringer for samme sted).

- [P3] Landing.js:1022 vs 826-828 — møtepunkt vises som «Molo dei Pescatori» i receipt men «{pickup}» (= «Monterosso») i bekreftelsen. Samme sted, to navn. → Samkjør ordlyden.

- [P3] Landing.js:963-979 — «Or ask us something first» med to WA_ALTS ligger PÅ done-skjermen, etter at kunden allerede har trykt Continue for å bestille. Å tilby «spør oss noe først» her, etter beslutningen, er rekkefølge-rart og legger støy på den siste skjermen før WhatsApp. → Vurder å flytte spørsmåls-snarveiene til Customer service / tidligere, så done-skjermen er ren: Book on WhatsApp + email + go back.

- [P3] Landing.js:879-885 — «Tell a friend» (share) på bekreftelses-skjermen er fint, men `shareTrip` faller tilbake til `alert()` (1402) på desktop uten Web Share/clipboard — en rå nettleser-alert bryter den varme tonen. → Bruk en diskré in-popup bekreftelse i stedet for `alert`.

- [P3] Landing.js:704,1097-1098 — maks 8 gjester (tour.maxGuests), men ingen håndtering av «vi er flere enn 8» (større grupper). Eldre reisefølge på 10 har ingen vei videre uten å gjette. → Legg en «More than 8?» → WhatsApp-snarvei i guests-steget (matcher WA_ALTS-tankegangen).

- [P3] Landing.js:151-159 + 248-263 — Esc/klikk-utenfor lukker hele booking-overlayet midt i flyten uten advarsel; på mobil finnes ✕ (254-260). «Tilbake/endre» er mulig inne i hvert steg (Back-knapper finnes overalt — bra), men å lukke ved uhell mister alle valg. Akseptabelt for en lett flyt, men verdt å vite. → Ingen endring nødvendig; bekreft at det er ønsket.

- [P3] landing.css:1280-1287 — desktop-kortet er fast 860px høyt med intern scroll. Time-steget (3 tiles + Continue + Back) og receipt fyller fint, men på et kort som er låst til 860px kan korte steg (guests = 8 små tiles) se tomme ut nederst. På mobil (1665-1674) er høyden auto. → Kosmetisk: vurder vertikal sentrering av korte steg på desktop så de ikke «henger» i toppen.

## Spørsmål til Kristian
1. WhatsApp-nummer: skal Paolona/Andrea sitt ekte nummer inn nå, eller er norsk nr bevisst placeholder til pilot er klar? (P1 — blokkerer ekte booking)
2. Pickup- og aboard-stegene: skal de KOBLES INN i flyten (da blir det ~5-6 tap, ikke 3), eller FJERNES helt (matcher ~3 tap bedre)? Nå er de halvferdig død kode som likevel påvirker bekreftelse + backend.
3. Prising: er det bevisst at sunshine og sunset koster likt ($100) og kun sunrise er $150? Og er gruppe-rabatten (2+ = 10%, 4+ = 12%) korrekt og ønsket?
4. «Endre én ting»: ønsker du at f.eks. «Change the time» bare endrer tiden og går rett tilbake til kvittering (2 tap), i stedet for å tvinge kunden gjennom tid→gjester→dag?

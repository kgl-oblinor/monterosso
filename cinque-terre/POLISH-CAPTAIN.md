# POLISH — CAPTAIN / HUB / INNHOLD (audit)

Auditør: CAPTAIN/INNHOLD. Les `MÅL.md` + `COORDINATION.md` først.
Format: `- [P1|P2|P3] fil:linje — observasjon → forslag`

> Jeg har IKKE endret kode. Dette er en prioritert liste.

## P1 — må fikses (faktafeil / motsigelse / fjernet innhold)

- [P1] app/landing/Landing.js:503 — Kaptein-siden hardkoder navnet «Kristian Løkken» som skipper. Dette motsier (a) fasiten i MÅL.md (pilot-skipper = Andrea, båt Paolona) og (b) regelen om å holde navn/kjønn nøytralt der det er uavklart. Kristian = plattform-admin, IKKE skipperen. → Erstatt med nøytral tittel (f.eks. «Your skipper» / «The captain of the Paolona») til ekte navn er avklart; ikke bruk Kristians navn som skipper.
- [P1] app/landing/Landing.js:334-338 — Boat-siden omtaler skipperen gjennomgående som «He / his»; samme på kaptein-siden (510-511). tour.js sier pilot-skipper er Andrea (kvinne), og MÅL ber om kjønnsnøytralt der uavklart. Mannlig «søker rik dame over 70» kolliderer med kvinnelig skipper. → Avklar med Kristian (se spørsmål) og gjør pronomen konsistent med valgt skipper, ELLER omskriv whimsy-en kjønnsnøytralt.
- [P1] app/map/page.js:78-81 — Rest av FJERNET innhold: «Weddings aboard · all-inclusive, from $1,500» beskrives som exit-vinduet. Bryllup/utleie er bevisst fjernet fra produktet. → Fjern bryllups-referansen fra flow-mappen (eller oppdater map-en til faktisk «Explore»-hub-flyt).
- [P1] app/landing/landing.css:1254 — Kommentar lister fortsatt «(booking, village, boat, rental, weddings)» som popup-typer. Rester av fjernet innhold (rental/weddings finnes ikke lenger). → Oppdater kommentaren til de faktiske popups (booking, village, boat, hub, captain, news, customer service).

## P2 — sammenheng / komplethet (ting kunden ville lurt på)

- [P2] app/landing/Landing.js:345-369 vs lib/tour.js:9 — Boat «Included»/facts mangler VARIGHET. tour.js har `durationHours: 3` og hero sier «three unhurried hours», men boat-faktaboksen (Boat/Guests/Departures/From) nevner ikke varighet. → Legg til en «Duration · ~3 hours»-fakta.
- [P2] app/landing/Landing.js (hele) — Ingen steder forklares AVBESTILLING/endring tydelig for kunden, utover CS-knappen «Change a booking». Eldre kunde lurer typisk på «kan jeg avbestille gratis?». → Vurder én rolig linje (f.eks. i CS eller på boat-siden): fri endring/avbestilling, betaling om bord.
- [P2] app/landing/Landing.js (hele) — Mangler «hva ta med» (badetøy, solkrem, hatt) selv om turen inkluderer «swim & snorkel». Naturlig spørsmål for målgruppen. → Vurder en kort «Good to bring»-linje på boat-siden.
- [P2] app/landing/Landing.js:359 vs villageData — Boat-siden sier «up to {tour.maxGuests}» (8), men gruppe-rabatt-teksten (WA_ALTS «group of 4») og pris-logikken stemmer. OK — men «private sail» + «up to 8» kan forvirre om det er privat eller delt. → Klargjør at hele båten er privat (ikke delt med fremmede).
- [P2] app/landing/Landing.js:571-578 — News-siden er statisk/sesong-generisk («lemon groves in flower… golden hour»). Trygt nå, men «while the season is upon us» blir feil utenfor sesong. → Gjør tidløs, eller marker som redigerbar/datostemplet.
- [P2] app/landing/Landing.js:681 — CS «Call us» sier «09:00–22:00, Monday–Saturday», men boat «Departures: sunrise · sunshine · sunset» og slots inkluderer sunrise 07:00. Telefon stengt søndag + før 09 kan kollidere med sunrise-booking-spørsmål. → Avklar åpningstid vs avgangstider (small inkonsistens).
- [P2] app/landing/Landing.js:684-688 — Møtepunkt «Molo dei Pescatori» vises i CS og i receipt (1022), men pickup-steget (1047-1075) lar kunden velge by; da blir «Molo dei Pescatori» feil for ikke-Monterosso. Receipt hardkoder Molo dei Pescatori uavhengig av valgt pickup. → Vis valgt pickup i receipt i stedet for hardkodet Molo (konsistens med pickup-steget).

## P3 — finpuss / sjarme / småplukk

- [P3] app/landing/Landing.js:322-403 — Boat-siden og kaptein-siden gjentar NESTEN ordrett samme to avsnitt («unhurried, elegant gentleman… rich lady over seventy… simple rooms»). Føles som copy-paste når man åpner begge. → Differensier: la boat-siden handle om båten, kaptein-siden om personen (unngå duplikat-avsnitt).
- [P3] app/landing/Landing.js:336-339 — Whimsy «still seeking a rich lady over seventy» er sjarmerende og på rett side av grensen (morsom, ikke upassende) — BEHOLDES per MÅL. Ingen endring; notert som bevisst.
- [P3] app/landing/Landing.js:341-344 / 513-517 — «keeps a few simple rooms along this coast… which one looks out on the sea» grenser mot utleie-domenet (rom-utleie). Sjarmerende som karakter, men sjekk at det ikke leses som et tilbud (rental fjernet). → Behold som farge, men ikke gjør det til CTA/tilbud.
- [P3] app/landing/Landing.js:793-805 — `boxNum` regnes ut men ser ikke ut til å rendres noe sted (teller ble fjernet per Skraphaugen). Mulig død kode. → Verifiser/fjern hvis ubrukt (nevnt, ikke slettet).
- [P3] app/landing/Landing.js:1176-1218 + 1046-1089 — Stegene `aboard` og `pickup` er fullt implementert men ser ikke ut til å nås i hovedflyten (receipt→time→guests→date→receipt→done). Hvis bevisst skjult: ok; hvis ikke: død/uoppnåelig kode. → Avklar om pickup/aboard skal være med i flyten.
- [P3] app/landing/villageData.js — Landsby-tekstene er korrekte, varierte og tydelig forskjellige (Monterosso=strand, Vernazza=havn/klokketårn, Corniglia=høyt/377 trinn, Manarola=Sciacchetrà/krybbe, Riomaggiore=Via dell'Amore). Bra. Liten: Via dell'Amore var lenge stengt (gjenåpnet 2024) — sjekk at «leads along the sea» ikke leses som «du kan gå den i dag» hvis den er delvis stengt. → Verifiser status, evt. mildne.
- [P3] app/landing/Landing.js:323 vs villageData Monterosso «al Mare» — Boat-tittel «Aboard the Paolona» og village «Monterosso al Mare» er konsistente. Ingen endring.
- [P3] lib/tour.js:23-24 — TODO: ekte WhatsApp-nummer er fortsatt plassholder (+47-nummeret, norsk). For en italiensk pilot vil kunder forvente et italiensk/skipper-nummer. → Bytt til skipperens ekte nummer før live-marketing (kjent TODO).
- [P3] app/landing/Landing.js:13-15 / 1471-1480 — Signpost/villageData har «Monterosso» (kort) mens VillagePage bruker «Monterosso al Mare». Bevisst (firstName-helper), konsistent. Ingen endring.

---

## Oppsummering

Antall: **P1 = 4 · P2 = 7 · P3 = 9**

### De 5 viktigste
1. **P1 — Kaptein-navn «Kristian Løkken» (Landing.js:503):** Kristian er plattform-admin, ikke skipper. Motsier fasiten (Andrea/Paolona) og nøytral-navn-regelen. Bytt til nøytral tittel.
2. **P1 — Pronomen-kollisjon «He/his» vs kvinnelig pilot-skipper Andrea (Landing.js:334-338, 510-511):** whimsy «søker rik dame over 70» forutsetter mann; tour.js sier Andrea. Må avklares.
3. **P1 — Bryllups-rest «Weddings aboard… from $1,500» (map/page.js:78-81):** fjernet innhold lever videre i flow-mappen.
4. **P1 — CSS-kommentar lister «rental, weddings» (landing.css:1254):** oppdater til faktiske popups.
5. **P2 — Receipt hardkoder møtepunkt «Molo dei Pescatori» (Landing.js:1022) selv om pickup-steget lar kunden velge by:** vis valgt pickup for konsistens.

### Spørsmål til Kristian
1. **Skipperens kjønn/navn:** Er pilot-skipperen Andrea (kvinne) eller Andre (mann)? Whimsy-en «søker rik dame over 70» passer en mann. Skal vi (a) gjøre skipperen til en mann (Andre) og beholde whimsy-en som den er, (b) beholde Andrea og omskrive whimsy-en kjønnsnøytralt/feminint, eller (c) holde alt nøytralt («your skipper») til navnet er låst?
2. **Kaptein-siden:** Skal den ha et navn i det hele tatt nå, eller stå nøytral til skipperen er bekreftet? (Den skal uansett ikke si «Kristian Løkken».)
3. **Pickup/aboard-stegene:** Er disse bevisst skjult fra hovedflyten, eller skal de kobles inn? Påvirker også møtepunkt-visningen i kvitteringen.
4. **Map-siden (app/map):** Er den en intern dev-doc (da: rydd bort bryllup), eller skal den fjernes/oppdateres til å speile dagens «Explore»-hub?

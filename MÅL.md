# 🎯 MÅL — Monterosso · FASIT (les meg først, alltid)

> **Øverst = fasiten: sannheten om produktet NÅ.** Aldri «nylig rettet» her. Endrede/forkastede sannheter flyttes ned til 🗑️ Skraphaugen (med kategori + dato/tid). Endres bare av Kristian (eller Krin på hans ordre). Alle agenter leser dette før de gjør noe.

## Visjon
**«Uber for båtturer» i Italia** — en markedsplass som kobler reisende med lokale båteiere/skippere langs hele kysten. **Monterosso · Cinque Terre er piloten** (live i dag). Skipperen = «føreren», kunden bestiller + chatter, **Kristian = plattform-admin**.

## Hovedprodukt (pilot)
**Monterosso · Cinque Terre** — rolig, vakker privat båttur-opplevelse. Live: `~/monterosso/cinque-terre` (Cloudflare). https://monterosso-cinque-terre.kgl-56a.workers.dev

## Nordstjerne
Eldre person bestiller fra mobil på **~3 tap**, og chatter etterpå **direkte med skipperen** — og det **skalerer til mange båter/skippere** over hele Italia. Varm men stram. Aldri «BESTILL NÅ!» — rolig guiding («Continue»).

## Sanne fakta (fasit)
- **Første kunde (pilot-skipper):** **mann** (Monterosso), båt «Paolona» — landingssiden er hans tur. Navn låses senere via admin (**aldri «Kristian Løkken»** — Kristian = plattform-admin). Kaptein-whimsy «søker rik dame over 70» beholdes (mannlig kaptein, He/his).
- **Design:** strengt system — 4px-spacing, 1.2 type-skala, skarpe kanter (radius 0), **glass-popups (ganske transparente, vakre) av lik størrelse** (720px bred, 860px høy desktop). Fonter: Fraunces (tekst), Limelight (gull-CTA), Great Vibes («Read more»/CS).
- **Stemme:** varm/stram; rolige fremover-verb; ingen falske fakta. Kaptein-whimsy («søker rik dame over 70») **beholdes** bevisst.
- **Landingssiden:** to deler — en **SEO-del** (by-sider/innhold som fanger søk) + en **bestillings-del**.
- **Booking — to veier:** (a) **uten konto → WhatsApp** (null friksjon), eller (b) **friksjonsfri konto → rett inn i chatten**, som ER bestillingssystemet. Landing-bookingen er kvittering-først (gjett 2 gjester, neste avgang) → Continue → kontakt (~3 tap).
- **Chat = bestillingssystemet (skipper-styrt forhandling):** kunden signaliserer ønske om tur (via bestillings-delen: dato/gjester/tid) → dukker opp i **skipperens chat-dashboard** («de som vil ut»). **KUN skipperen kan starte og styre forhandlings-kjeden.** Skipper sender et **strukturert tilbud** (alternativer: tider/lengder/priser, kan legge på **rabatt**) → kunden **Godtar** ✅ eller sender **motbud** 🔄 → frem og tilbake til enighet → tur. Standard listepris er fortsatt $100/gjest; rabatt gis **kun i forhandlingen, etter skipperens skjønn**. Kunden kan **aldri fyre av tilbud selv** — kun svare på skipperens.
- **Pris:** **$100 per gjest, ingen rabatt** (flat standardpris). **Lokketilbud** (spesialtilbud/kampanjer) kan lages av **admin/skipper** og vises på utvalgte undersider — men standardprisen er alltid $100/gjest. Pris + tilbud er **konfigurerbart per skipper** (admin styrer).
- **Flyt:** landing → **én knapp** → rask booking (~3 tap). Bestemmer kunden seg ikke der og da → **avdekk web-app-skallet**.
- **Web-app-skall:** venstre **sidebar, default lukket**; **profil-ikon nederst, chat øverst**; rekkefølge ovenfra: **Chat · Turer · Kvitteringer · Andre reiser · Andre land**.
- **Bakgrunner (landing):** velgbare via toggles — dagens **2 animerte scener** (dag/natt) + **5 bilde-bakgrunner** (fullskjerm). Når booking-popupen åpnes (uansett bakgrunn) skjules **ALT levende** — båt, overskrift, hero-knapp, alle animasjoner — bak **glass-popupen** er kun den stille bakgrunnen. Tekst/knapper matcher glass-uttrykket.
- **Konfigurerbart per oppføring (skipper/tjeneste):** **copy/tekst**, **båttider** (slots), **sted/land**, og **tjenestetype** — charterturer, **taxibåt**, frakt/transport, eller andre båt-former. Hver skipper-side genereres fra sin egen oppførings-konfig (generalisert `tour.js`); plattformen er **ikke hardkodet** til Monterosso/Paolona.
- **Kontakt:** +47 93 00 86 00 · kgl@oblinor.no · møtepunkt Molo dei Pescatori, Monterosso.
- **Plattform-appen (selve appen) — «app først og fremst»:** appens egen inngang er et **live Cinque Terre-kart** over de 5 landsbyene — **Uber-stil, ekte sanntids-GPS** (ikke faste prikker). **Rolle-basert synlighet:** **admin** ser **alle** (kunder + skippere) · **kunde** ser **kun skippere** · **skipper** ser **kun kunder**. Ingen kunde ser andre kunder. Kart-inngangen ER markedsplassen (kunden finner en skipper på kartet); i tillegg har hver skipper sin egen delbare side (`…/skipper`).
- **Scope (første runde):** kun skippere i **de 5 landsbyene** (Monterosso, Vernazza, Corniglia, Manarola, Riomaggiore). Alle deler **samme** Cinque Terre-scene/kart — kun *innholdet* varierer per skipper. **Andrea = første instans**, ikke en spesiallaget side.
- **Skipper selv-onboarding:** skipperen lager konto og legger inn båt / adresse / avgangslandsby / turer / tider / priser / bilder → appen **genererer hans landingsside** fra hans egen konfig (generalisert `tour.js`, felles scene). **Admin godkjenner** før siden publiseres (anbefalt for pilot — endelig bekreftes).
- **Sanntid:** **polling først** (3–5 sek, gjenbruker chat-poll-mønsteret); ekte push (Durable Objects/WebSocket) er en senere oppgradering. **Stedtjeneste** spørres **kontekstuelt på kart-/app-inngangen** («Del posisjon»), ikke på skipperens markedsføringsside — GPS-tillatelsen ER samtykket (GDPR-ryddig).
- **Ny funksjon:** kunde↔skipper-**chat** + lett onboarding — **TRE veier inn for kunden**: (1) lag konto via **telefon**, (2) lag konto via **e-post**, ELLER (3) **ingen konto i det hele tatt** — kontakt skipperen direkte (WhatsApp-melding eller ring). Ingen kode/passord, **ingen verifisering, ingen godkjenningskø — kunde-kontoen er aktiv umiddelbart** (rett inn, maks friksjonsfritt). **Asymmetri i godkjenning:** **kunde = ingen verifisering/godkjenning** (instant aktiv) · **skipper = admin godkjenner** (vettes før publisering). **Chatten lever KUN inne i brukersiden (web-app-skallet)** — som opprettes ved telefon ELLER e-post; de som hopper over konto, bruker WhatsApp/telefon direkte. **Roller:** skipper (båteier) · kunde/reisende · admin (Kristian). **Egen D1.** Kontakter/tråder kommer fra bestilling (reservasjonskode).

## Tilstand nå
- ✅ Båt-landingsside ferdig-polert (scene, popups, booking-flyt, hub, copy)
- ✅ **Cookie-fundament** (anonym førsteparts visitor-ID, `public/visitor.js`) på BEGGE landingssider — robust på Android/iOS/desktop, klart for live-kartet (presence steg 1)
- ⏳ **Live-presence (steg 2):** geolokasjon-tillatelse + posisjons-tjeneste (polling) + Cinque Terre-kart (admin=alle · kunde=skippere · skipper=kunder)
- ⏳ Chat · onboarding · admin/skipper-side · data/DB — ledige lanes (se COORDINATION.md)

> Fullt sidekart + fakta-katalog: Obsidian `Prosjekter/Monterosso – Cinque Terre – sidekart & kunnskapsbase`. Logg: `WORKLOG.md`. Koordinering: `COORDINATION.md`.

---

# 🗑️ Skraphaugen (gamle sannheter — endret/fjernet)
> Her ligger det som EN GANG var sant men ikke er det lenger. Kategori · dato/tid · hva.

### Design
- *Glass-popups (forsøk 1)* · 2026-06-21 ~09:30 · transparent Apple-glass over den **bevegelige scenen** (sjøen gjennom) → ble grått/grumsete → midlertidig cream.
- *Solide cream-popups* · 2026-06-21 ~18:30 · **reversert** — vi går tilbake til **glass** (ganske transparent, vakkert), men nå over **stille bakgrunner** (bilde eller frosset scene; alt levende skjult når popup åpnes), så det ikke blir grumsete.
- *Popup-størrelse* · 2026-06-21 ~09:50 · `min-height` (vokste ulikt) → fast 860px (alle like).
- *Lukke-knapp ✕* · 2026-06-21 · fjernet (stygg) → lukk via klikk-utenfor/Esc.

### Arkitektur
- *chat-prosjektet* · 2026-06-21 ~10:15 · trodde det skulle bygges som eget nytt prosjekt → **feil**; vi bygger i båt-prosjektet og gjenbrukte chat-design fra en referanse-app.

### Innhold/stemme
- *Knappetekst* · 2026-06-21 · «Send →»/«Another time»/«Read more»/«N/8» → «Continue»/«Change the time»/«Explore», teller fjernet.

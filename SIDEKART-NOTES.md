# Sidekart / arkitektur — notater (fra Kristian, løpende)

> Jeg noterer alt Kristian sier fra 2026-07-01. Nyeste øverst i hver bolk.

## To landingssider
- **BoatUber-plattform-landing** — den bredere markedsplassen ("Uber for båter"), større enn én skipper.
- **Skipper-/kunde-landing** (Andrea/Monterosso) — første kunde, `/` + `/s/andrea`.
- Begge → login og → booking.

## Navngiving (nytt)
- Den første siden (i dag «Cookies») → **Landingsside 0**. Den andre → **Landingsside 1**. (Nummerert landing-serie.)
- Kristian rydder kart-layouten selv (i 2D) — jeg holder meg unna layouten.

## Cookie-rot (starter treet)
- Treet starter med **Cookies (ja/nei)**. Ja/nei konvergerer på landingen; **divergerer først på «Check availability»**-kontaktsteget.
- **JA** → fanger e-post/telefon/posisjon mens de bruker siden → booking-kontaktsteget spør bare om det vi IKKE har (har begge → ingen felt; har ett → spør resten; NEI → spør e-post/tlf).
- (I dag har vi bare anonym `visitor.js` + returnerende «Use my saved details». Consent-banner + fangst = roadmap.)

## Login-flyt
- Landingens **Log in** → for reisende kunde → **traveler dashboard**.
- På web: trykk Log in → man kommer **alltid først** til en **ikke-innlogget web-dashboard-versjon** → så inn.
- **Tre linjer fra Landingpage:** (1) **les mer / SEO**, (2) **Log in** — disse to ender **samme sted: web-dashboardet** (SEO ligger der, login lander der), (3) **Book**.

## Web-dashboard (ikke-innlogget) — spec
- **Fullskjerm, én skjerm, ingen scroll** (i hvert fall på mobil).
- **Sidebar togglet ut**, enkelt lukkbar → lenker ut til **SEO-sidene**.
- Herfra kan kunden: **logge inn** · **bestille** · **se kart over aktive båter i området** · laste ned app.

### Live kart (aktive båter) — spec
- **Ekte kart** (ikke stilisert) — Leaflet/OSM (eller Mapbox).
- Vi vet hvor **Andreas båt** er. Når **Andreas mobil er innenfor 100 m radius** av båten → båten **aktiveres** på kartet. Ellers **sover** båten.
- **Foreløpig kun Andrea** — ingen andre skippere/kunder ennå (én båt).

### Delt kart (Uber-modell)
- **Samme kart vises også skipperen.** Dersom **kunden har skrudd på posisjon**, ser skipperen kundens **live-posisjon** på kartet — slik som Uber (sjåfør ser passasjer). Toveis live-kart.

## SEO (informativt innhold, ikke direkte knyttet til båttjenesten)
- Handler om **steder, turer, mat, restauranter** osv. — informative sider som hjelper den som søker.
- **Uendelig antall sider.** Alle linker **på samme måte, på alle mulige måter** (opp/forelder · side/søsken · ned/barn · + alltid → Dashboard og → Book).
- Vises **aggregert med stats** (antall + snitt ord/artikkel), ikke løse sider.
- Sitter **mellom landing og web-dashboard** i kartet.
- **Kort-typer (lagret som kategori):**
  - `SEO · Hovedkategori` — Steder, Gjøremål, Mat & drikke, Reviews, Praktisk
  - `SEO · Underkategori` — Restauranter, Vin, Strender …
- Kategori-forslag: Steder · Gjøremål · Reviews (+ Mat & drikke · Praktisk/reiseplanlegging · Dagsplaner · Foto · Historie/festivaler · FAQ).

### A/B-testing (annonsering)
- SEO-/landingssidene skal kunne **A/B-testes** — og **multivariat A/B/C/D/E/F** — når vi **annonserer på Google og Facebook**. Test varianter for konvertering per kampanje.

## Kort-grammatikk (universell)
Hvert kort, i denne rekkefølgen: (1) **navn på side-type øverst**, (2) **gruppe med linker** (dersom den har), (3) **CTA-valg nederst**. Startet med landingssidene (BoatUber + Andrea).

## Kort-typer (system)
- Vi har **ulike typer kort** (ikke bare farge — ulik struktur/felt). Når vi er ferdige med én → «lagre som kategori» → føres inn i `CARD_TYPES`-registeret.

## Kartet (verktøyet)
- **3D-nettverk**, **top-down** (treet starter fra toppen, flyter ned). Data-drevet, robust, **gjenbrukbar kode** (skal brukes videre).
- Skal være **luftig og ryddig**. Ingen auto-rotasjon.
- 3 dashboards: **kunde · skipper · admin**.
- Fil: `cinque-terre/public/sidekart-3d.html`.

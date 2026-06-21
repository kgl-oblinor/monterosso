# 🎯 MÅL — Monterosso · FASIT (les meg først, alltid)

> **Øverst = fasiten: sannheten om produktet NÅ.** Aldri «nylig rettet» her. Endrede/forkastede sannheter flyttes ned til 🗑️ Skraphaugen (med kategori + dato/tid). Endres bare av Kristian (eller Krin på hans ordre). Alle agenter leser dette før de gjør noe.

## 🚫 ABSOLUTT REGEL (alle agenter)
**Det er STRENGT FORBUDT å endre originale Oblinor-filer** (`~/_ref/oblinor-borrower-chat` og Oblinor på GitHub). De er **kun kilde/referanse**. Fremgangsmåte: **kopier HELE over til vår egen kopi først**, og tilpass kun DEN kopien (strip lån-domenet etterpå). Aldri rør originalen.

## Visjon
**«Uber for båtturer» i Italia** — en markedsplass som kobler reisende med lokale båteiere/skippere langs hele kysten. **Monterosso · Cinque Terre er piloten** (live i dag). Skipperen = «føreren», kunden bestiller + chatter, **Kristian = plattform-admin**.

## Hovedprodukt (pilot)
**Monterosso · Cinque Terre** — rolig, vakker privat båttur-opplevelse. Live: `~/monterosso/cinque-terre` (Cloudflare). https://monterosso-cinque-terre.kgl-56a.workers.dev

## Nordstjerne
Eldre person bestiller fra mobil på **~3 tap**, og chatter etterpå **direkte med skipperen** — og det **skalerer til mange båter/skippere** over hele Italia. Varm men stram. Aldri «BESTILL NÅ!» — rolig guiding («Continue»).

## Sanne fakta (fasit)
- **Første kunde (pilot-skipper):** Andrea (Monterosso), båt «Paolona» — landingssiden er hennes tur.
- **Design:** strengt system — 4px-spacing, 1.2 type-skala, skarpe kanter (radius 0), **solide cream-popups (#f7f1e3) av lik størrelse** (720px bred, 860px høy desktop). Fonter: Fraunces (tekst), Limelight (gull-CTA), Great Vibes («Read more»/CS).
- **Stemme:** varm/stram; rolige fremover-verb; ingen falske fakta. Kaptein-whimsy («søker rik dame over 70») **beholdes** bevisst.
- **Booking:** kvittering-først (gjett 2 gjester, neste avgang) → Continue → kontakt → bekreftelse (~3 tap). Avslutning via WhatsApp/e-post.
- **Flyt:** landing → **én knapp** → rask booking (~3 tap). Bestemmer kunden seg ikke der og da → **avdekk web-app-skallet**.
- **Web-app-skall:** venstre **sidebar, default lukket**; **profil-ikon nederst, chat øverst**; rekkefølge ovenfra: **Chat · Turer · Kvitteringer · Andre reiser · Andre land**.
- **Konfigurerbart per oppføring (skipper/tjeneste):** **copy/tekst**, **båttider** (slots), **sted/land**, og **tjenestetype** — charterturer, **taxibåt**, frakt/transport, eller andre båt-former. Hver skipper-side genereres fra sin egen oppførings-konfig (generalisert `tour.js`); plattformen er **ikke hardkodet** til Monterosso/Paolona.
- **Kontakt:** +47 93 00 86 00 · kgl@oblinor.no · møtepunkt Molo dei Pescatori, Monterosso.
- **Ny funksjon:** kunde↔skipper-**chat** + lett onboarding (kun **e-post ELLER telefon** — ingen kode/passord). **Chatten lever KUN inne i brukersiden (web-app-skallet)** — som opprettes nettopp ved e-post ELLER telefon. **Gjenbruk fra `oblinor-borrower-chat`** (kun kopiere, aldri endre originalen), **egen D1**. **Rolle-mapping:** Oblinor **låntaker → båteier/skipper**, **långiver → kunde/reisende**, **admin → Kristian**.
  - **Gjenbruk KUN mekanikken:** chat (1-til-1, polling, meldings-UI), lett onboarding, admin-innboks/oversikt, struktur.
  - **IKKE gjenbruk:** låne-/utlåns-domenet (lån, ordrer, investor/loaner-sync fra oblinor.no, matrikkel/eiendom, mislighold) eller noe hardkodet til Oblinor. **Kontakter/tråder kommer fra bestilling (reservasjonskode), ikke lån.**

## Tilstand nå
- ✅ Båt-landingsside ferdig-polert (scene, popups, booking-flyt, hub, copy)
- ⏳ Chat · onboarding · admin/skipper-side · data/DB — ledige lanes (se COORDINATION.md)

> Fullt sidekart + fakta-katalog: Obsidian `Prosjekter/Monterosso – Cinque Terre – sidekart & kunnskapsbase`. Logg: `WORKLOG.md`. Koordinering: `COORDINATION.md`.

---

# 🗑️ Skraphaugen (gamle sannheter — endret/fjernet)
> Her ligger det som EN GANG var sant men ikke er det lenger. Kategori · dato/tid · hva.

### Design
- *Glass-popups* · 2026-06-21 ~09:30 · transparent Apple-glass (sjøen gjennom) → **forkastet**, ble grått/grumsete → nå solide cream-flater.
- *Popup-størrelse* · 2026-06-21 ~09:50 · `min-height` (vokste ulikt) → fast 860px (alle like).
- *Lukke-knapp ✕* · 2026-06-21 · fjernet (stygg) → lukk via klikk-utenfor/Esc.

### Arkitektur
- *oblinorchat* · 2026-06-21 ~10:15 · trodde det skulle bygges som eget nytt prosjekt → **feil**; vi bygger i båt-prosjektet og gjenbruker design fra Oblinor.

### Innhold/stemme
- *Knappetekst* · 2026-06-21 · «Send →»/«Another time»/«Read more»/«N/8» → «Continue»/«Change the time»/«Explore», teller fjernet.

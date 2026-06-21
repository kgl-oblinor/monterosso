# 🎯 MÅL — Monterosso · FASIT (les meg først, alltid)

> **Øverst = fasiten: sannheten om produktet NÅ.** Aldri «nylig rettet» her. Endrede/forkastede sannheter flyttes ned til 🗑️ Skraphaugen (med kategori + dato/tid). Endres bare av Kristian (eller Krin på hans ordre). Alle agenter leser dette før de gjør noe.

## Hovedprodukt
**Monterosso · Cinque Terre** — rolig, vakker privat båttur-opplevelse. Live: `~/monterosso/cinque-terre` (Cloudflare). https://monterosso-cinque-terre.kgl-56a.workers.dev · Kristian = **admin**.

## Nordstjerne
Eldre person bestiller fra mobil på **~3 tap**, og chatter etterpå **direkte med skipperen**. Varm men stram. Aldri «BESTILL NÅ!» — rolig guiding («Continue»).

## Sanne fakta (fasit)
- **Design:** strengt system — 4px-spacing, 1.2 type-skala, skarpe kanter (radius 0), **solide cream-popups (#f7f1e3) av lik størrelse** (720px bred, 860px høy desktop). Fonter: Fraunces (tekst), Limelight (gull-CTA), Great Vibes («Read more»/CS).
- **Stemme:** varm/stram; rolige fremover-verb; ingen falske fakta. Kaptein-whimsy («søker rik dame over 70») **beholdes** bevisst.
- **Booking:** kvittering-først (gjett 2 gjester, neste avgang) → Continue → kontakt → bekreftelse (~3 tap). Avslutning via WhatsApp/e-post.
- **Kontakt:** +47 93 00 86 00 · kgl@oblinor.no · møtepunkt Molo dei Pescatori, Monterosso.
- **Ny funksjon (under arbeid):** kunde↔skipper-**chat** + lett onboarding (e-post + SMS-verifisering), **design gjenbrukes fra Oblinor** (långiver↔låntaker↔admin → kunde↔skipper).

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

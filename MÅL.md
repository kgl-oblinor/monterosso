# 🎯 MÅL — Monterosso (les meg først, alltid)

> Inneholder ALLTID målet for hovedproduktet. Endres bare av Kristian (eller Krin på hans ordre). Alle agenter leser dette før de gjør noe.

**Sist oppdatert:** 2026-06-21 · Krin

## Hovedprodukt
**Monterosso · Cinque Terre** — en rolig, vakker privat båttur-opplevelse. Live: `~/monterosso/cinque-terre` (Cloudflare Workers). https://monterosso-cinque-terre.kgl-56a.workers.dev

## Nordstjernen
En **eldre person skal kunne bestille fra mobil på ~3 tap**, og etterpå **chatte direkte med skipperen**. Varm men stram tone. Aldri «BESTILL NÅ!» — rolig guiding («Continue»).

## Ny funksjon: chat + lett onboarding (gjenbruk fra Oblinor)
- Vi **gjenbruker chat + onboarding-designet fra Oblinor** (långiver↔låntaker↔admin) og oversetter til båt: **kunde ↔ skipper**, **Kristian = admin**.
- Lett bruker: valgfri e-post + SMS/WhatsApp-nr → verifisering (e-post + SMS).
- Stilrent desktop-dashboard (lukket venstre-sidebar: chat-ikon øverst, profil nederst; tomt til høyre).
- Chat knyttet til booking (reservasjonskode).

## Prinsipper
- Varm, stram, elegant. Ikke overdetaljert. Mobil-først for kunder, desktop for admin/skipper.
- Strengt designsystem (4px-spacing, 1.2 type, skarpe kanter, solide flater).
- Minste ærlige versjon først. Ingen falske fakta.

## Status (kort)
- [x] Båt-landingsside (scene, popups, booking-flyt, hub, copy strammet)
- [ ] Chat kunde↔skipper (design fra Oblinor)
- [ ] Lett onboarding + verifisering (e-post + SMS)
- [ ] Admin-/skipper-side (Kristian = admin)

> Fullt sidekart + fakta-katalog: Obsidian `Prosjekter/Monterosso – Cinque Terre – sidekart & kunnskapsbase`.

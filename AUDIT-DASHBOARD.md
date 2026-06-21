# AUDIT — Dashboard-logikk (baatchat innlogget app)

> Auditør: dashboard-logikk. Fokus: navigasjon + handlings-logikk, ikke pixler.
> Kilde lest (ikke endret): `baatchat/web/src/app/*`, `features/dashboard/**`, `features/admin/**`, `features/auth/**`, samt `cinque-terre/app/landing/Landing.js`.
> Fasit: `MÅL.md` (web-app-skall: lukket venstre sidebar, profil nederst, chat øverst; rekkefølge Chat · Turer · Kvitteringer · Andre reiser · Andre land; chatten lever KUN inne i bruker-skallet; roller: kunde, skipper, admin=Kristian).

---

## 1) Navigasjons-kart

### Ruter (`app/router.tsx` + `ProtectedRoute.tsx`)
```
/login            → LoginForm                (offentlig)
/register         → RegisterForm             (offentlig, OTP-onboarding e-post ELLER reservasjonskode)
/admin/login      → AdminLoginPage           (offentlig)
/admin            → AdminUsersPage           (krever rolle=admin, ellers → /dashboard)
/dashboard        → DashboardPage            (krever innlogget; admin → bounces til /admin)
/  og  /*         → redirect til /dashboard
```

Rolle-gating (ProtectedRoute):
- Ikke innlogget → `/login` (eller `/admin/login` for admin-områder).
- `requireAdmin` + ikke admin → `/dashboard`.
- Ikke-admin-rute + rolle=admin → `/admin`. (Admin kan altså ALDRI se kunde/skipper-chatten — bevisst skille.)

### Kunde / skipper-flyt (web-app-skallet = `DashboardLayout`)
```
[innlogget, status=active]
  IconRail (16px venstre)        ConversationsPanel (320px)      ChatThread (resten)
  ┌──────────┐                   ┌──────────────────┐           ┌───────────────────────┐
  │ logo     │                   │ "Chat" + søk     │           │ header (navn/subtittel)│
  │ [Chat]●  │                   │ Samtaler         │           │ "Gjelder" reservasjon  │
  │          │                   │ Skippere/Kunder  │           │ meldinger              │
  │          │                   │ (kontaktliste)   │           │ composer (gull send)   │
  │ (avatar) │ ← konto/logg ut   └──────────────────┘           └───────────────────────┘
  └──────────┘
```
- Mobil: én rute viser én pane (liste ELLER tråd m/ tilbake-pil). md+: side-ved-side.
- `status != active` (kunde/skipper) → `PendingApproval` (venter på admin-godkjenning, «sjekk status på nytt» / «logg ut»).

### Admin-flyt (`AdminUsersPage`)
```
Sidebar (256px, ÅPEN/synlig på desktop; drawer på mobil)
  Administrasjon (logo + e-post)
  • Til godkjenning   (badge: antall i kø)   ← default-tab
  • Skippere          (liste + Legg til/Rediger via SkipperForm)
  • Kunder            (CustomersTab)
  • Samtaler          (ConversationsTab, kun-lesing)
  Logg ut (nederst)
```

---

## 2) Knapp / handlings-logikk (primær-handling pr. skjerm)

| Skjerm | Primær-handling | Plassering | Type | Vurdering |
|---|---|---|---|---|
| LoginForm | «Logg inn» | inline, full bredde, submit | gull AuthButton | OK, konsekvent |
| RegisterForm steg 1 | «Send kode» | inline submit | gull | OK |
| RegisterForm steg 2 | «Opprett konto» + «Tilbake» | inline, par | gull + outline | OK, har tilbake |
| PendingApproval | «Sjekk status på nytt» | inline | gull | OK |
| ChatThread | «Send» (pil-ikon) | sticky composer nederst | rund gull-knapp | OK, sticky |
| ConversationsPanel | velg samtale | liste-rader | — | mangler «ny samtale»-affordance (se P-liste) |
| Admin → Skippere | «Legg til skipper» | top-høyre over tabell | gull | OK |
| SkipperForm | «Legg til/Lagre» + «Avbryt» | bunn inline | gull + outline | OK, ikke sticky (lang form) |
| Admin rad | «Godkjenn» / «Sperr» | rad-høyre | gull / outline | OK, konsekvent |

Gull (`#ead27e`) = primær overalt. Outline = sekundær/avbryt. Konsistent og bra.

---

## 3) Logikk-hull (de viktigste)

**H1 — IngenInngang fra landingen (kritisk).** `Landing.js` har INGEN lenke til appen
(`/login`, `/register`, `/dashboard` eller workers.dev-URL finnes ikke i fila). Booking-flyten
ender kun i WhatsApp/kalender/tel. MÅL sier: «Bestemmer kunden seg ikke der og da → avdekk
web-app-skallet» og «Chatten lever KUN inne i brukersiden». I dag finnes ingen vei dit. Dette
er det største hullet: hele den innloggede appen er en øy uten dør.

**H2 — IconRail har bare «Chat», resten av MÅL-menyen mangler.** MÅL krever rekkefølge
ovenfra: **Chat · Turer · Kvitteringer · Andre reiser · Andre land**, med profil nederst.
`IconRail.tsx` `NAV`-arrayet inneholder kun `{ Chat }` (kommentar bekrefter at de andre ble
fjernet). Turer/Kvitteringer/Andre reiser/Andre land finnes ikke som nav-punkter eller skjermer.
Profil-ikon nederst finnes (avatar m/ logg ut) — det stemmer.

**H3 — Sidebar er «alltid lukket/skjult» feil sted.** MÅL: kunde-skallet skal ha venstre
sidebar **default lukket**. I dag er kunde-IconRail en alltid-synlig 64px-stripe (ikke en
lukkbar sidebar), mens ADMIN har den lukkbare/utvidede 256px-sidebaren. Mønsteret for
«lukket sidebar som åpnes» lever altså i admin, ikke i kunde-skallet der MÅL ber om det.
(Tolknings-spørsmål: er 64px-rail = «lukket sidebar»? Da mangler «åpne»-tilstanden med labels.)

**H4 — «Tom kontaktliste» = blindvei for kunde.** I `DashboardLayout` viser tom tilstand
«Du har ingen kontakter å chatte med ennå.» En kunde som nettopp registrerte seg via
reservasjonskode forventer å se SIN skipper. Hvis kontakter ikke auto-genereres fra
reservasjonen, står kunden i en blindvei uten handling (ingen «finn skipper»/«bestill tur»-CTA).
Bør verifiseres mot backend (`api/threads.ts` `useConversations`).

**H5 — Send-feil svelges stille.** `ChatThread.send()` har `catch {}` med kun en kommentar
(«a toast layer can surface this later»). Hvis en melding feiler (nett/404 etter retry),
beholdes drafted tekst, men brukeren får INGEN tilbakemelding om at sendingen feilet.
Logikk-hull: stille feil i den primære handlingen.

**H6 — `/` og `/*` sender alle til `/dashboard`, også admin og uinnlogget — unødvendige
hopp.** Fungerer (ProtectedRoute videreruter), men en uinnlogget som treffer rot får
`/ → /dashboard → /login`. Greit nok, men admin som bokmerker `/` får `/ → /dashboard → /admin`
(dobbel redirect). Mindre hull: ingen ekte «hjem» pr. rolle.

### Sekundære observasjoner (ikke topp-6)
- **Ingen «tilbake» fra PendingApproval annet enn logg ut** — riktig, men en kunde uten godkjenning kan ikke gjøre noe meningsfullt. OK gitt domenet.
- **Admin↔kunde-flyt holdes rent adskilt** (ProtectedRoute bouncer admin ut av /dashboard). Bra — ingen blanding.
- **ConversationsPanel mangler «start ny samtale»-knapp** — nye kontakter dukker bare opp hvis backend leverer dem; ingen eksplisitt handling for å initiere.
- **`/admin/login` vs `/login`** er to separate sider — bra skille, men ingen lenke mellom dem (admin må kjenne URL-en). Sannsynlig bevisst (skjult admin-inngang).

---

## 4) Sammenheng med landingen (foreslått inngang)

MÅL-flyten: `landing → én knapp → rask booking (~3 tap)`. Hvis kunden ikke bestiller der og da
→ **avdekk web-app-skallet**. Chatten skapes ved e-post ELLER telefon i booking.

Logisk inngang som mangler i dag:
1. **Etter booking-bekreftelse:** legg en rolig «Continue»-lenke i bekreftelses-popupen (der WhatsApp/kalender allerede ligger, `Landing.js` ~linje 799–944) som peker til `…/register` med reservasjonskoden forhåndsutfylt (`/register?code=MT-…`). Da treffer kunden steg 2 (kode+passord) nesten ferdig.
2. **Diskré «Logg inn»-lenke** i landing-hub/footer for tilbakevendende kunder → `…/login`.
3. **Skipper-inngang:** skipper får konto opprettet av admin (SkipperForm) → onboardes via `/register` (e-post-modus) eller direkte `/login`. Trenger en kommunisert URL (e-post fra admin), ikke en landing-knapp.

Teknisk: landing (Next/Cloudflare) og baatchat-web (Vite SPA) er to deployer; inngangen blir en
ekstern `href` til app-URL-en, ikke en intern route. App-URL bør settes som env i landingen.

---

## Prioritert tiltaksliste

### P1 (blokkerer kjernereisen)
- **P1-a (H1+H4):** Skap inngangen landing→app. Minst: «Continue/Åpne samtalen»-lenke i booking-bekreftelsen → `/register?code=…`, og sørg for at registrering via reservasjonskode auto-kobler kunden til riktig skipper (kontakt synlig i ConversationsPanel). Uten dette er chatten utilgjengelig.
- **P1-b (H5):** Vis feilmelding når melding ikke kan sendes (erstatt stille `catch {}` med en inline-feil/toast + retry). Primær-handlingen må aldri feile usynlig.

### P2 (MÅL-samsvar / forventet navigasjon)
- **P2-a (H2):** Bestem skjebnen til MÅL-menyen (Turer · Kvitteringer · Andre reiser · Andre land). Enten (i) bygg dem, eller (ii) oppdater MÅL til at kun Chat finnes nå. Per i dag avviker appen fra fasit — velg én sannhet.
- **P2-b (H3):** Avklar «default lukket venstre sidebar» for kunde-skallet: skal 64px-rail telle som lukket, eller skal den ha en åpne/utvid-tilstand med labels (slik admin har)? Juster IconRail deretter.
- **P2-c:** Legg diskré «Logg inn» på landingen for tilbakevendende kunder/skippere.

### P3 (polish / robusthet)
- **P3-a (H6):** Rolle-bevisst rot-redirect (`/` → /admin for admin, /dashboard ellers) for å unngå doble hopp.
- **P3-b:** Vurder «start ny samtale»-affordance i ConversationsPanel hvis kunder skal kunne initiere mot flere skippere.
- **P3-c:** Tomtilstand i kunde-chat bør tilby en handling (lenke tilbake til landing/booking) i stedet for ren tekst-blindvei.

---

## Hva mangler vs MÅL (kort)
- ❌ **Inngang landing → app** (ingen lenke i Landing.js — kritisk).
- ❌ **Turer** (ikke i nav, ikke som skjerm).
- ❌ **Kvitteringer** (ikke i nav/skjerm — finnes kun som «Gjelder»-strip inne i chatten).
- ❌ **Andre reiser** (ikke i nav/skjerm).
- ❌ **Andre land** (ikke i nav/skjerm).
- ⚠️ **«Default lukket sidebar» for kunde** — uklart om 64px-rail oppfyller dette (ingen åpne-tilstand).
- ✅ **Chat øverst, profil nederst** (IconRail oppfyller dette).
- ✅ **Chat lever kun inne i bruker-skallet** (ingen chat utenfor /dashboard).
- ✅ **Roller kunde/skipper/admin adskilt** (ProtectedRoute).
- ✅ **Onboarding kun e-post ELLER reservasjonskode** (RegisterForm), uten passord-krav i identifisering.

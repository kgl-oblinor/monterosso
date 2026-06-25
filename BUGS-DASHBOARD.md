# BUGS — Monterosso chat-plattform (baatchat)

> BUG-HUNT-agent. Fokus: ÅPENBARE feil i de tre partenes flyt (KUNDE, SKIPPER, ADMIN).
> KUN funnet + rapportert — ingen kode endret, ingen git.
> Kilder lest (ikke endret): `baatchat/src/worker/{index,auth,chat,admin,email}.ts`,
> `baatchat/web/src/{app,features/auth,features/dashboard,features/admin,lib,mocks}/**`,
> `baatchat/wrangler.toml`, `baatchat/web/.env*`, `cinque-terre/app/landing/Landing.js`.
> Fasit: `MÅL.md`. Tidligere kart: `AUDIT-DASHBOARD.md`.

Format: `- [P1|P2|P3] [part] fil:linje — feil → hva som skjer → foreslått fiks`
P1 = blokkerer en part helt. P2 = delvis ødelagt / feil oppførsel. P3 = polish/robusthet.

---

## Antall per prioritet
- **P1: 6**
- **P2: 7**
- **P3: 5**

---

## De 5 verste (blokkerer en part)

1. **[P1][kunde] Booking lagrer ALDRI en reservasjon i chat-DB-en.**
   `cinque-terre/app/landing/Landing.js` poster kun til `/api/track` (analytics) + WhatsApp/kalender.
   Ingen kunde/`reservation`-rad skrives til baatchat-D1. Da finnes ingen `reservation_code`
   `resolveForRegistration` kan slå opp, og `listContacts` (som er JOIN på `reservations`)
   gir alltid tom liste. → Kunden kan verken registrere seg med reservasjonskode ELLER se
   skipperen sin. Hele kunde-inngangen + chatten er død. Fiks: la booking skrive customer +
   reservation til chat-D1 (f.eks. `POST /admin/reservations` med `ADMIN_SYNC_KEY`, eller egen
   onboarding-route), ELLER seed reservasjoner på annen måte før chat kan brukes.

2. **[P1][felles] apiBase-default peker på feil worker-URL.**
   `web/src/lib/env.ts` defaulter `apiBase` til `https://monterosso-chat.workers.dev`, men den
   faktiske deployen er `https://monterosso-chat.kgl-56a.workers.dev` (se `.env.production`).
   Om `VITE_API_BASE` ikke er satt i en build (f.eks. lokal `pnpm build` uten prod-env, eller
   `.env` med default), treffer ALLE kall (login/register/chat/admin) feil/ikke-eksisterende
   domene → alt feiler. Fiks: sett riktig default til `...kgl-56a.workers.dev`, eller gjør
   `VITE_API_BASE` påkrevd ved build.

3. **[P1][admin] Admin-katalog + skipper-CRUD omgår mock-laget.**
   `web/src/features/admin/api/hooks.ts:22-104,143-159` kaller `apiClient` direkte for
   `useSkipperDirectory`, `useCustomerDirectory`, `useSkippers`, `useCreateSkipper`,
   `useUpdateSkipper`, `useAdminThreads`, `useSetSkipper/CustomerEmail`. Men `mockAdmin.ts`
   implementerer KUN `listUsers/approve/revoke/verifyEmail`. Default `VITE_USE_MOCKS=true`
   (`env.ts`). → I demo-/default-modus: «Til godkjenning» virker (mock), men «Skippere»,
   «Kunder», «Samtaler» og hele SkipperForm slår mot ekte (eller ikke-konfigurert) backend og
   feiler/CORS-blokkeres. Admin-siden er halvt død. Fiks: enten utvid mockAdmin med disse
   metodene, eller rut alle admin-kall gjennom `adminApi` (som bytter på `env.useMocks`).

4. **[P1][kunde/skipper] OTP-e-post sendes ikke uten SENDGRID_API_KEY.**
   `src/worker/auth.ts:182-183, 334-335` — `registerStart`/`adminRecoveryStart` sender bare
   e-post hvis `env.SENDGRID_API_KEY` finnes; ellers `console.log` av koden. `wrangler.toml`
   har `EMAIL_FROM = "post@monterosso.example"` (placeholder, ikke en verifisert SendGrid-
   avsender) og ingen `SENDGRID_API_KEY` (skal settes som secret). → Hvis secret ikke er satt
   i prod: kunde/skipper får ALDRI koden, kan ikke fullføre registrering = kommer ikke inn.
   Selv om secret er satt vil placeholder `EMAIL_FROM` gi SendGrid 403 (uverifisert avsender).
   Fiks: sett `SENDGRID_API_KEY` (secret) + en ekte verifisert `EMAIL_FROM` før lansering;
   verifiser at registrering faktisk leverer kode.

5. **[P1][kunde] Ingen inngang fra landing til appen.**
   `cinque-terre/app/landing/Landing.js` har ingen lenke til `/register`, `/login` eller
   app-URL. (Bekreftet: grep finner ingen.) → Selv om alt annet virker, finnes ingen vei inn
   til den innloggede chatten for kunden. Fiks: legg «Continue/Åpne samtalen»-lenke i booking-
   bekreftelsen → `<app>/register?code=MT-…`, og diskré «Logg inn» i footer. (Allerede notert
   som P1-a i AUDIT-DASHBOARD H1.)

---

## Full liste

### P1 — blokkerer en part helt
- [P1][kunde] cinque-terre/app/landing/Landing.js:134,970,1366 — booking persisterer ingen reservasjon til chat-D1 (kun `/api/track` + WhatsApp/kalender) → reservasjonskode + kontakter kan aldri resolve, kunde-chat død → skriv customer+reservation til chat-D1 ved booking.
- [P1][felles] web/src/lib/env.ts:7 — `apiBase` default `monterosso-chat.workers.dev` ≠ deployet `monterosso-chat.kgl-56a.workers.dev` → alle API-kall feiler hvis VITE_API_BASE mangler i build → rett default / gjør var påkrevd.
- [P1][admin] web/src/features/admin/api/hooks.ts:22-104 — directory/skipper/threads-hooks kaller apiClient direkte, men mockAdmin har dem ikke; useMocks=true default → Skippere/Kunder/Samtaler/SkipperForm feiler i demo → rut via adminApi eller utvid mockAdmin.
- [P1][kunde|skipper] src/worker/auth.ts:182-183 — OTP sendes kun hvis SENDGRID_API_KEY satt; EMAIL_FROM er placeholder `post@monterosso.example` → uten ekte secret/avsender kommer koden aldri frem, registrering kan ikke fullføres → sett SENDGRID_API_KEY + verifisert EMAIL_FROM.
- [P1][kunde] cinque-terre/app/landing/Landing.js (hele) — ingen lenke til /register|/login|app-URL → ingen vei inn til chatten → legg Continue-lenke i bekreftelse + Logg inn i footer (AUDIT H1).
- [P1][admin] src/worker/index.ts:229 — admin-gate aksepterer `authz === ADMIN_SYNC_KEY` (rå, uten «Bearer»). Hvis ADMIN_SYNC_KEY ved uhell er tom/uoppsatt OG en klient sender tom Authorization, blir `bySyncKey=false` ok — men merk: dersom `ADMIN_SYNC_KEY` er satt og en ANGRIPER gjetter den, får full admin-API uten JWT. Mer presserende: sync-nøkkelen er ment for server-til-server, ikke nettleser — ufarlig i seg selv, men dobbeltsjekk at den ikke lekker til frontend-bundles. → bekreft at ADMIN_SYNC_KEY kun brukes server-side; vurder å kreve `Bearer`-prefiks også her.

### P2 — delvis ødelagt / feil oppførsel
- [P2][kunde|skipper] web/src/features/dashboard/components/ChatThread.tsx:97-99 — `catch {}` svelger send-feil stille (kun kommentar om toast «later») → bruker får ingen beskjed om at melding feilet → vis inline-feil/retry (AUDIT H5).
- [P2][admin] web/src/features/admin/components/SkipperForm.tsx:73 — `base_price: Number.isFinite(price) ? Math.round(price*100) : 0` sender 0 når feltet er tomt → tom pris lagres som «0 EUR», ikke «ingen pris» (MÅL: pris konfigureres per skipper, $100 default) → send `null`/utelat når tomt så worker beholder COALESCE.
- [P2][admin] web/src/features/admin/components/SkipperForm.tsx:74 vs src/worker/admin.ts:300-320 — formen sender `slots: JSON.stringify([...])`; `normalizeSlots` håndterer streng som starter med `[` → ok, MEN `toFormState` (linje 33-38) gjør `JSON.parse(s.slots)` på et felt som backend allerede returnerer som array (`Skipper.slots: string[]` i admin.ts mapSkipper) — type sier `string | null` i web/types men worker gir array → `JSON.parse(array)` kaster, faller til `slots = s.slots` (string «[object Object]»-aktig) → rediger-skjema kan vise feil avgangstider. → samkjør type: worker returnerer array, så ikke JSON.parse i toFormState.
- [P2][admin] web/src/features/admin/components/SkipperForm.tsx:102 — `canSave` krever navn + (e-post ELLER telefon), men worker `validateSkipperInput` krever KUN navn → form er strengere enn API (greit), men hint-teksten «Du trenger e-post eller telefon» håndheves bare i frontend; en skipper uten e-post kan ikke onboardes (ingen adresse å sende OTP til) → behold kravet, men gjør det tydelig at e-post (ikke bare telefon) trengs for konto.
- [P2][admin] src/worker/admin.ts:373-381 — `validateSkipperInput` validerer `email`-format, men SkipperForm sender alltid `email: ""` (tom streng) når tomt; `input.email !== ""` hopper over → ok. Men ved opprettelse uten e-post lages skipper uten innloggingsmulighet (ingen OTP-mål) → vurder å kreve e-post for skippere som skal ha konto.
- [P2][kunde] web/src/features/dashboard/components/DashboardLayout.tsx:72-73 — tom kontaktliste = ren tekst «Du har ingen kontakter å chatte med ennå.» uten handling → blindvei for nyregistrert kunde → tilby lenke tilbake til booking/landing (AUDIT H4/P3-c).
- [P2][felles] src/worker/index.ts:36 — CORS-fallback aksepterer kun `*.monterosso-chat-web.pages.dev`, men deployet frontend er `monterosso-app.kgl-56a.workers.dev` (kun i ALLOWED_ORIGINS-var). Preview-deploys av workers.dev-frontend (andre hashes) blir CORS-blokkert → utvid regex/ALLOWED_ORIGINS til faktisk frontend-domene-mønster.

### P3 — polish / robusthet
- [P3][felles] web/src/app/router.tsx:32-33 — `/` og `/*` → /dashboard for alle; admin får `/`→/dashboard→/admin (dobbel redirect), uinnlogget `/`→/dashboard→/login → rolle-bevisst rot-redirect (AUDIT H6).
- [P3][kunde|skipper] web/src/features/dashboard/components/IconRail.tsx:18 — NAV har kun «Chat»; MÅL krever Chat·Turer·Kvitteringer·Andre reiser·Andre land → bygg menyen eller oppdater MÅL (AUDIT H2).
- [P3][kunde|skipper] web/src/features/dashboard/components/IconRail.tsx — 64px alltid-synlig rail, ikke «default lukket sidebar» som MÅL ber om → avklar tolkning (AUDIT H3).
- [P3][kunde|skipper] web/src/features/dashboard/api/threads.ts:198-209 — `useMessages` henter alltid `?since=0` (full historikk hvert 4. sek) i stedet for delta `since=lastId` som worker støtter → unødig last; bruk delta-polling.
- [P3][felles] web/src/features/auth/store.ts — token i localStorage uten utløps-sjekk klient-side; et utløpt 7-dagers JWT gir `isAuthenticated=true` til /auth/me feiler → vurder å validere token mot /me ved oppstart og logge ut ved 401.

---

## Verifisert OK (ikke feil)
- Rolle-gating i ProtectedRoute: admin holdes ute av /dashboard, ikke-admin ute av /admin. Konsistent.
- Worker SkipperInput-felt matcher SkipperForm (name/email/phone/address/location/country/boat_name/service_type/slots/base_price/currency/payment_ref). POST→201 {skipper}, PUT→{skipper}. Kontrakt stemmer.
- ChatThread 404-self-heal (stale thread) + retry-once er fornuftig.
- Eligibility-gate (delt reservasjon) hindrer chat-lekkasje mellom uvedkommende.
- Admin-login + recovery (allow-listet e-post + felles passord/OTP) henger sammen frontend↔worker.

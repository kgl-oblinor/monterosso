# STRIP-PLAN — baatchat (DASH-lane)

> Inventar + plan for å tilpasse den kopierte `oblinor-borrower-chat` til båt-plattformen.
> Status-koder: **FJERN** (lån-domene, slettes/tømmes) · **BEHOLD** (ren mekanikk) · **TILPASS** (rebrand kunde↔skipper).
> Les `../MÅL.md` (fasiten) først. Denne planen rører KUN `baatchat/**`.

## Rolle-mapping (fasit)
| Oblinor | Båt | Forklaring |
|---|---|---|
| `loaner` (låntaker) | `skipper` | båteier/fører (konfigurerbar oppføring) |
| `investor` (långiver) | `customer` (kunde/reisende) | bestiller + chatter |
| `admin` | admin (Kristian) | plattform-admin |
| `loans` + `orders` (felles ordre = eligibility) | `reservations` (reservasjonskode) | kontakt/tråd stammer fra en booking, ikke et lån |

**Eligibility-regelen endres:** Oblinor = «investor og loaner deler en ordre i et lån».
Båt = «kunde og skipper deler en reservasjon» (reservasjonskode `MT-DDMMYY-<gjester>`).

**Konfigurerbart per skipper/oppføring:** `skippers`-raden bærer `service_type` (charter/taxi/frakt),
`location`, `country`, `boat_name` osv. Ingenting hardkodes til Monterosso/Paolona — pilot-data seedes,
men skjemaet støtter mange skippere/tjenestetyper.

---

## Worker (`src/worker/**`)

| Fil | Status | Hva |
|---|---|---|
| `index.ts` | TILPASS | Hono-app/ruter beholdes. FJERN: `/admin/sync*`, `/admin/resolve-addresses`, all broadcast-epost (`/admin/email/*`), `scheduled`-cron (sync). Rebrand `/chat/contacts/:id/loans` → `/chat/contacts/:id/reservations`. Env: dropp Oblinor-WP/sync/SendGrid-broadcast-felter. |
| `chat.ts` | TILPASS | Kjernemekanikk (threads, messages, polling, read_state) BEHOLDES. Bytt `loans`/`orders`/`investors`/`loaners` → `reservations`/`skippers`/`customers`. Eligibility = delt reservasjon. `contactLoans` → `contactReservations` (reservasjonskode + dato + gjester i stedet for adresse/beløp). |
| `auth.ts` | TILPASS | OTP/PBKDF2/JWT/login/registrering/admin-recovery BEHOLDES. `resolveForRegistration`: investor-by-email→customer-by-email, loaner-by-orgnr→skipper-by-reservasjonskode-ELLER-email. Lett onboarding: e-post ELLER telefon (org.nr fjernes). |
| `admin.ts` | TILPASS | Innboks/oversikt/godkjenning BEHOLDES. `loaners`/`investors`-directory → `skippers`/`customers`. FJERN `setLoanerEmail`/`setInvestorEmail` matrikkel-kontekst (behold e-post-override, rebrandet). Tråd-oversikt rebrandes. |
| `sync.ts` | **FJERN** | Hele oblinor.no WordPress-sync (investorer/lån/ordrer/matrikkel). Slettes. |
| `wp.ts` | **FJERN** | WordPress REST-klient. Slettes. |
| `kartverket.ts` | **FJERN** | Matrikkel→adresse-oppslag. Slettes. |
| `broadcast.ts` | **FJERN** | Masse-epost til låntakere/långivere. Slettes (ikke i MÅL-mekanikken). |
| `email.ts` | TILPASS | SendGrid OTP-epost BEHOLDES (engangskode til onboarding). Rebrand Oblinor-merkevare/logo/footer → nøytral plattform-branding (konfigurerbar avsender). |

## Migrasjoner (`migrations/**`)
Fersk D1 (egen database) — vi skriver om kildeskjemaet i stedet for å bære lån-tabeller.

| Fil | Status | Hva |
|---|---|---|
| `0001_source.sql` | TILPASS→erstattes | FJERN `loaners`/`investors`/`loans`/`orders`/`sync_state`. NYTT: `skippers`, `customers`, `reservations` (med `reservation_code`, `guests`, `trip_date`). |
| `0002_chat.sql` | TILPASS | `chat_accounts`/`threads`/`messages`/`read_state`/`moderation_log` BEHOLDES. Kolonner rebrandet: `loaner_id`→`skipper_id`, `investor_id`→`customer_id`, `loaner_agents`→`skipper_agents`, `oblinor_id`→`party_id`. |
| `0003_loan_matrikkel.sql` | **FJERN** | Matrikkel/kommune. Slettes. |
| `0004_chat_account_password.sql` | BEHOLD | Konsolideres inn i nytt 0002. |
| `0005_account_approval.sql` | BEHOLD | Konsolideres inn i nytt 0002. |
| `0006_address_verified.sql` | **FJERN** | Kartverket-adresse. Slettes. |
| `0007_email_drafts.sql` | **FJERN** | Broadcast-utkast. Slettes. |

> Siden dette er en helt ny D1 uten produksjonsdata, konsoliderer jeg til to rene migrasjoner
> (`0001_source.sql` boat-domene + `0002_chat.sql` rebrandet) i stedet for å stable ALTER-er.

## Config
| Fil | Status | Hva |
|---|---|---|
| `wrangler.toml` | TILPASS | Navn `oblinor-borrower-chat`→`monterosso-chat`. FJERN Oblinor-WP/sync-vars + cron. D1-navn rebrandet (ny `database_id` settes av Krin ved provisjonering). Plattform-vars (`PLATFORM_NAME`, `SUPPORT_EMAIL`, `EMAIL_FROM`). |
| `package.json` | TILPASS | Navn + `db:migrate`-script rebrandet. |
| `.github/workflows/deploy.yml` | TILPASS (Krin/F-lane) | Notert som åpent — deploy/CI eies av integrasjonslanen. |

---

## Frontend (`web/src/**`)

| Fil | Status | Hva |
|---|---|---|
| `app/router.tsx`, `App.tsx`, `ProtectedRoute.tsx`, `providers.tsx` | BEHOLD | App-skall/ruting. |
| `features/dashboard/**` (Layout, IconRail, ConversationsPanel, ChatThread, Skeletons, PendingApproval) | TILPASS | Chat-UI/polling BEHOLDES. `ChatThread` `LoanContext` → `ReservationContext` (reservasjonskode/dato/gjester i stedet for lån/adresse/beløp). Rolle-etiketter Låntaker/Långiver → Skipper/Kunde. |
| `features/dashboard/api/threads.ts` | TILPASS | Behold queries/mutations/polling. `Contact.role` investor/loaner→customer/skipper. `useContactLoans`→`useContactReservations`. `roleLabel`/`formatAmount` rebrandet. |
| `features/auth/**` | TILPASS | OTP/login/registrering/forgot BEHOLDES. `RegisterForm`: rolle-velger Låntaker/Långiver→Skipper/Kunde; identifikator e-post/org.nr → e-post/telefon/reservasjonskode. Branding-tekst rebrandet. |
| `features/admin/AdminUsersPage.tsx` | TILPASS | Faner: Til godkjenning · ~~Låntakere~~Skippere · ~~Långivere~~Kunder · Samtaler · ~~Epost~~(fjernes). |
| `features/admin/components/LoanersTab.tsx` | TILPASS→`SkippersTab` | Skipper-directory + delt tabell-chrome (Thead/Pager/SearchBox beholdes). |
| `features/admin/components/InvestorsTab.tsx` | TILPASS→`CustomersTab` | Kunde-directory. |
| `features/admin/components/ConversationsTab.tsx` | TILPASS | Tråd-oversikt rebrandet. |
| `features/admin/components/PendingTab.tsx`, `AdminUI.tsx`, `AdminLoginForm.tsx`, `AdminForgotFlow.tsx` | TILPASS | Godkjenning/innboks BEHOLDES, etiketter rebrandet. |
| `features/admin/components/EmailTab.tsx`, `EmailComposer.tsx` | **FJERN** | Broadcast-epost-UI. Slettes + fjernes fra `AdminUsersPage`. |
| `features/admin/api/{adminApi,hooks,types}.ts` | TILPASS | Behold konto-handlinger (approve/revoke/verify). FJERN broadcast-epost-hooks/typer + `loanCount`/`orderCount`/`matrikkel`. |
| `lib/{apiClient,env,queryClient,utils}.ts` | BEHOLD/TILPASS | Behold. `env.apiBase` default rebrandet til monterosso-Worker. |
| `mocks/**` (fixtures, mockAuth, mockAdmin, mockDashboard) | TILPASS | Demo-data rebrandet til skippere/kunder/båt-samtaler. |
| `index.html`, logoer (`oblinor-logo*.svg/png`) | TILPASS | Tittel/meta/favicon rebrandet. Logo-referanser nøytraliseres. |
| `.env.example`, `.env.production` | TILPASS | API-base + kommentarer rebrandet. |

---

## Åpne spørsmål til Kristian
1. **Reservasjonskode-format:** Jeg bruker `MT-DDMMYY-<gjester>` (fra MÅL). `MT` antar jeg er en
   skipper/oppførings-prefiks (Monterosso). Skal prefikset være per-skipper-konfigurerbart
   (f.eks. en `code_prefix`-kolonne på `skippers`)? Jeg har lagt inn `code_prefix` på `skippers`
   som default-valg, gi beskjed om det skal være globalt i stedet.
2. **Onboarding-identifikator:** MÅL sier «e-post ELLER telefon — ingen kode/passord».
   Men chat-mekanikken fra Oblinor er bygget på passord + OTP. Foreløpig valg: behold OTP til
   e-post/telefon for å bekrefte eierskap, men gjør passord valgfritt/utelatt (magisk-lenke-aktig).
   For nå beholder jeg passord-feltet i koden (minste endring) men registrering kan også skje via
   **reservasjonskode** som identifikator. Bekreft om passord skal fjernes helt senere.
3. **Telefon-OTP:** SMS-sending er ikke implementert (kun SendGrid e-post). Telefon-onboarding
   er forberedt i skjema/ruter, men SMS-leverandør må kobles på (egen oppgave). For nå: e-post-OTP
   fungerer, telefon lagres men verifiseres ikke før SMS er på plass.
4. **Egen D1 + secrets:** Ny `database_id`, `CHAT_JWT_SECRET`, `SENDGRID_API_KEY`, `ADMIN_PASSWORD`
   provisjoneres av integrasjons-/F-lanen (Krin). `wrangler.toml` har plassholdere.
5. **Admin-epost (broadcast):** Fjernet helt (ikke i MÅL-mekanikken). Gi beskjed hvis Kristian
   likevel vil ha utgående masse-epost til kunder/skippere senere.

## Logg
- 2026-06-21: Inventar fullført. Startet strip av worker-lån-domene.
- 2026-06-21: Backend fullført. To rene migrasjoner (0001 boat-domene + 0002 chat rebrandet),
  worker rebrand verifisert (ingen lån-/sync-/wp-/kartverket-/broadcast-rester). La til
  `skippers`-kolonner per delt kontrakt (address, slots, base_price, currency, payment_ref,
  active). Nye admin-endepunkter: GET/POST/PUT /admin/skippers (skipper-CRUD for Kristian),
  GET /admin/customers, GET /admin/reservations. tsc --noEmit grønt. Migrasjoner kjørt mot
  throwaway sqlite (alle tabeller/kolonner OK, CRUD-SQL verifisert).

# 🤝 KOORDINERING — flere agenter samtidig (les før du rører noe)

Mål: alle agenter jobber samtidig **uten å krasje** (aldri to i samme fil), og alle ser hva som skjer. Les `MÅL.md` (fasiten) FØRST. tmux klart.

## Reglene (kort)
1. **Les `MÅL.md`** (fasiten) først. Alt tjener målet.
2. **Velg ÉN lane.** Jobb kun i din lane sine filer (overlapper ikke). Lag **bare nye filer** i din mappe — rør aldri andres.
3. **Claim før** du rører noe utenfor din lane (rad i CLAIMS: fil · agent · `LÅST` · tid; `FRI` når ferdig).
4. **Aldri rør en `LÅST` fil.** Sjekk CLAIMS + `WORKLOG.md`.
5. **Logg alltid** i `WORKLOG.md`: `[tid] [agent] hva — filer`. Append-only.
6. Egen branch/worktree: `agent/<navn>/<lane>`. Små, hyppige commits.

## Lanes (ikke-overlappende) — kodebase `cinque-terre/`
| Lane | Eier | Mappe/filer |
|---|---|---|
| **A · Chat (kunde↔skipper)** | Krin-team | `cinque-terre/app/chat/**`, `cinque-terre/components/chat/**`, `cinque-terre/app/api/messages/**` |
| **B · Onboarding/konto + verifisering** | Krin-team | `cinque-terre/app/(auth)/**`, `cinque-terre/app/api/auth/**`, `cinque-terre/lib/auth*` |
| **C · Admin/skipper-side** | Krin-team | `cinque-terre/app/admin/**`, `cinque-terre/components/admin/**` |
| **D · Data/DB (D1: users, messages)** | Krin-team | `cinque-terre/db/**`, `cinque-terre/lib/db*` |
| **E · Innhold/copy** | _ledig_ | tekst-strenger (IKKE layout/CSS) |
| **G · Design (dashboard)** | Krin-team | `cinque-terre/components/dashboard/**` (+ egne `.css`, IKKE `landing.css`) · design-spec |
| **F · Krin: landing + integrasjon + review** | **Krin** | `cinque-terre/app/landing/**`, `landing.css`, rot-config, merge |

## Oppdrag per lane (briefs)
- **A Chat:** kunde↔skipper-tråd, knyttet til reservasjonskode. Gjenbruk Oblinor-chatmønster. Cream-flater, Fraunces, skarpe kanter.
- **B Onboarding:** valgfri e-post + SMS/WhatsApp-nr → lett bruker → verifisering (e-post + SMS). Ingen passord-friksjon.
- **C Admin:** skipper/Kristian = admin. Innboks med tråder per kode + svar.
- **D Data:** D1-schema: `users` (epost/tlf, verifisert), `messages` (kode, sender, tekst, tid), kobling til booking-kode.
- **G Design:** stilrent desktop-dashboard: **lukket venstre-sidebar (chat-ikon øverst, profil nederst), tomt til høyre.** Design-tokens fra fasiten. Lever spec + komponenter i `components/dashboard/`.

## CLAIMS (aktive fil-låser)
| Fil/mappe | Agent | Status | Tid |
|---|---|---|---|
| `cinque-terre/app/landing/**`, `landing.css` | Krin | LÅST | 2026-06-21 10:40 |
| Lanes A,B,C,D,G (mapper over) | Krin-team (worktrees) | LÅST | 2026-06-21 10:40 |

## Slik unngår claudesquad-agentene oss
- Ta en **ledig lane (E)** eller en av A–D/G hvis Krin-teamet ikke alt kjører den — sjekk CLAIMS.
- Les COORDINATION + CLAIMS + WORKLOG før hver økt; claim før delt fil; aldri rør LÅST. Egen branch.

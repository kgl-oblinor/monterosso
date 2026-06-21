# 🤝 KOORDINERING — flere agenter samtidig (les før du rører noe)

Mål: Kristians claudesquad-agenter + Krins team jobber samtidig **uten å krasje** (aldri to i samme fil), og alle ser hva som skjer. tmux er klart (`claudesquad_A/B/C/Frontendartist`, `krin`).

## Reglene (kort)
1. **Les `MÅL.md` først.** Alt arbeid tjener målet der.
2. **Velg ÉN lane.** Jobb kun i din lane sine filer (lanes overlapper ikke).
3. **Claim før du redigerer** noe utenfor din lane: legg en rad i CLAIMS (fil · agent · `LÅST` · tid). Sett `FRI` når ferdig.
4. **Aldri rør en `LÅST` fil.** Sjekk CLAIMS + `WORKLOG.md` først.
5. **Logg alltid** i `WORKLOG.md`: `[tid] [agent] hva — filer`. Append-only.
6. **Små, hyppige commits.** `git pull --rebase` før commit. Egen branch om mulig: `agent/<navn>/<lane>`.
7. **Delte filer** (`MÅL.md`, `COORDINATION.md`): kun via claim, helst kun Kristian/Krin.

## Lanes (ikke-overlappende) — kodebase: `cinque-terre/`
| Lane | Eier | Mappe/filer (kun disse) |
|---|---|---|
| **A · Chat (kunde↔skipper)** | _ledig_ | `cinque-terre/app/chat/**`, `cinque-terre/components/chat/**`, `cinque-terre/app/api/messages/**` |
| **B · Onboarding/konto + verifisering** | _ledig_ | `cinque-terre/app/(auth)/**`, `cinque-terre/app/api/auth/**`, `cinque-terre/lib/auth*` |
| **C · Admin/skipper-side** | _ledig_ | `cinque-terre/app/admin/**`, `cinque-terre/components/admin/**` |
| **D · Data/DB (D1 + meldinger)** | _ledig_ | `cinque-terre/db/**`, `cinque-terre/lib/db*`, migrasjoner |
| **E · Innhold/copy** | _ledig_ | tekst-strenger i landing (IKKE layout/CSS) |
| **F · Krin: landing-polish + integrasjon + review** | **Krin** | `cinque-terre/app/landing/**`, `cinque-terre/app/landing/landing.css`, rot-config |

> Krin eier **F** (landingssiden + integrasjon). Gi dine agenter A–E.

## CLAIMS (aktive fil-låser)
| Fil | Agent | Status | Tid |
|---|---|---|---|
| `cinque-terre/app/landing/**` | Krin | LÅST | 2026-06-21 10:25 |

## Slik unngår claudesquad-agentene Krins filer
- Gi hver agent **én ledig lane (A–E)**. Da rører de aldri `app/landing/**` (Krins F).
- Be hver agent: *«Les COORDINATION.md + CLAIMS + WORKLOG. Jobb kun i din lane. Vil du røre en delt/annen fil: legg CLAIM-rad + logg. Aldri rør en LÅST fil.»*
- Design å gjenbruke: **Oblinor** (chat + onboarding) — se det repoet for mønster, men bygg her i båt-prosjektet.
- Tryggest: hver agent på **egen branch** (`agent/navn/lane`); Kristian/Krin merger.

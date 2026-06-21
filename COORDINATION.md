# 🤝 KOORDINERING — flere agenter samtidig (les før du rører noe)

Mål: alle agenter jobber samtidig **uten å krasje** (aldri to i samme fil), og alle ser hva som skjer. Les `MÅL.md` (fasiten) FØRST. tmux klart.

## Reglene (kort)
1. **Les `MÅL.md`** (fasiten) først. Alt tjener målet.
2. **Velg ÉN lane.** Jobb kun i din lane sine filer (overlapper ikke). Lag **bare nye filer** i din mappe — rør aldri andres.
3. **Claim før** du rører noe utenfor din lane (rad i CLAIMS: fil · agent · `LÅST` · tid; `FRI` når ferdig).
4. **Aldri rør en `LÅST` fil.** Sjekk CLAIMS + `WORKLOG.md`.
5. **Logg alltid** i `WORKLOG.md`: `[tid] [agent] hva — filer`. Append-only.
6. Egen branch/worktree: `agent/<navn>/<lane>`. Små, hyppige commits.

## Lanes (ikke-overlappende) — tmux-teamet
To kodebaser i samme repo: **`cinque-terre/`** (landingen, Next.js) og **`baatchat/`** (chat-plattformen, kopi av Oblinor — Cloudflare Worker + Vite).

| Lane | Eier (tmux) | Mappe/filer | Rolle |
|---|---|---|---|
| **DASH · Dashboard / chat-plattform** | agent 1 | `baatchat/**` | Utfører |
| **LAND · Landingssider** | agent 2 | `cinque-terre/app/landing/**`, `landing.css` | Utfører |
| **SEO · SEO + innhold** | agent 3 | `cinque-terre/app/(by-sider)/**`, blogg-sider, `gjøremål`/innhold, metadata/sitemap — **nye sider + tekst, IKKE `landing.css`** | Utfører |
| **SYM · Symmetri-analyse (desktop+mobil)** | agent 4 | **rører INGEN kode** — kun måler/leser; skriver til `SYMMETRI-KØ.md` | Analytiker |
| **F · Krin: koordinering + integrasjon + review/merge** | **Krin** | rot-config, `MÅL.md`/`COORDINATION.md`/`WORKLOG.md`, merge, D1-migrasjon, deploy | Dirigent |

## Oppdrag per lane (briefs)
- **DASH:** tilpass den kopierte `baatchat/` til båt: **strip lån-domenet** (lån, ordrer, oblinor.no-sync, matrikkel, mislighold), rebrand til kunde↔skipper, admin=Kristian, kontakter/tråder fra **reservasjonskode** (ikke lån). Egen D1. Behold chat/onboarding/admin-mekanikken. Design-tokens fra fasiten.
- **LAND:** perfeksjoner landingssidene (scene, popups, booking-flyt, hub, copy). Cream-flater, Fraunces, skarpe kanter, 4px-spacing. Tar imot fikser fra `SYMMETRI-KØ.md`.
- **SEO:** by-sider (om byene), gjøremål, blogg, fakta-tekster — varmt men stramt, researchede fakta, ingen falske påstander. SEO: titler, meta, sitemap, struktur. Lager **nye** sider/tekst; rører ikke `landing.css`.
- **SYM:** mål symmetri/spacing/align på **desktop OG mobil**, pixel for pixel. Den **utfører ingenting selv** — den skriver **ferdige, konkrete prompts** (med mål/px + fil + hva som er skjevt) til `SYMMETRI-KØ.md`, som LAND/DASH plukker opp og fikser.

## SYMMETRI-KØ.md (analytiker → utfører)
- SYM **append-only**: `[ ] [tid] [side/viewport] problem (px/mål) → forslag → fil`. Aldri editér kode.
- LAND/DASH plukker øverste `[ ]`, fikser, setter `[x]` + logger i WORKLOG. Krin reviewer.

## CLAIMS (aktive fil-låser)
| Fil/mappe | Agent | Status | Tid |
|---|---|---|---|
| `cinque-terre/app/landing/**`, `landing.css` | LAND | LÅST | 2026-06-21 11:35 |
| `baatchat/**` | DASH | LÅST | 2026-06-21 11:35 |
| `cinque-terre/` chat-stillas (app/chat, app/(auth), app/admin/inbox, components/chat|admin|dashboard, lib/db|auth, db) | _superseded av baatchat_ | FRYST | 2026-06-21 11:35 |

## Slik unngår agentene hverandre
- Én lane hver. Les COORDINATION + CLAIMS + WORKLOG før hver økt; claim før delt fil; aldri rør LÅST. Egen branch/worktree.
- **SYM skriver aldri kode.** Landing-stillaset i `cinque-terre/` er FRYST (erstattes av `baatchat/`) — ikke bygg videre på det.

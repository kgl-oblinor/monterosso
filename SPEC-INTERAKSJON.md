# 🧭 SPEC — Interaksjon, knapper & navigasjon (Monterosso)

> Samkjørt fra RESEARCH-UX.md + AUDIT-IA-LANDING.md + AUDIT-DASHBOARD.md.
> Forankret i fasit-systemet (cream/blekk/gull/terracotta · Fraunces/Limelight/Great Vibes · radius 0 · 4px).
> Status: **forslag — venter på Kristians godkjenning før implementering.**

## A. Knapp-systemet (tre nivåer, aldri flere)
1. **Primær — gull «ticket»:** solid gull #ead27e, **blekk-tekst #07182a** (aldri cream/hvit — målt 1.33:1 = uleselig), **1–2px blekk-ramme** (ellers forsvinner formen mot cream), Limelight. **Én per skjerm.** Mobil: full bredde, sticky nederst, **samme y hver gang**.
2. **Sekundær — ghost:** blekk-ramme, transparent fyll, blekk-tekst. Til «tilbake/alternativ».
3. **Tertiær — script-lenke:** Great Vibes, til lavvekt-handlinger («Explore», «On Wikipedia»).
- Aldri to solide side om side. Aldri alle tre i én gruppe. Gull KUN til primær-handling — aldri dekorativt.
- Terracotta = aksent/store overskrifter (≥24px), ikke små-tekst-CTA.

## B. Navigasjons-logikk — landingen
- **Logo/tittel = hjem** på hver side/overlay. Marker alltid hvor du er.
- **Hub må bli oppdagbart fra hero** (i dag gjemt i en undersides footer). → Fast «Explore / Discover»-inngang synlig fra hero.
- **«Tilbake» skal bety ÉN ting** (i dag tre: scene/side/Hub). Konsekvent ghost-«tilbake» øverst.
- **Primær gull-CTA = alltid samme handling = booking.** «The boat →» o.l. som *navigerer* nedgraderes til ghost/script (gull reserveres til «bestill»).
- **Captain når-bar symmetrisk:** ekte knapp/lenke fra Boat → Captain (i dag ren tekst).

## C. Kobling landing ↔ SEO-sider (de «to verdenene»)
- **SEO-side → booking, ikke hero:** CTA går til `/?book=1` som auto-åpner booking-overlayet.
- **Landsby-dublett løses:** overlay-landsby lenker til full SEO-side («Read more»), SEO-landsby lenker tilbake til booking. Ingen frittstående dubletter.
- **Landing-overlays kan lenke UT til relevante SEO-sider** (Boat → /cinque-terre-by-boat, Captain → /guide).

## D. Dashboard-navigasjon (innlogget app)
- **Inngang fra landingen (kritisk — finnes ikke i dag):** booking-bekreftelsen får en primær «Continue» → `app-URL/register?code=<reservasjonskode>` (forhåndsutfylt). Diskré «Log in» i landing-footer. Teknisk: app-URL via env i landingen (to separate deployer).
- **IconRail = MÅL-menyen:** Chat (øverst) · Turer · Kvitteringer · Andre reiser · Andre land · profil (nederst). Tomme seksjoner får rolige «kommer»/tom-tilstander, ikke blindveier.
- **Lukk-bar sidebar i KUNDE-skallet** (ikon-only lukket → ikon+etikett åpen), ikke bare i admin.
- **Primær-handling i fast header-slot:** én gull-ticket, samme y på tvers av visninger.
- **Send-feil må vises** (i dag svelget i `catch {}`) — rolig feilmelding + retry.
- **Tom kontaktliste** får en handling, ikke bare tekst.

## E. Konsistens-lover (landing OG dashboard)
- Samme handling = **samme sted + samme farge + samme ord**.
- Ett verb per konsept: «Continue» overalt — aldri også «Next»/«Proceed».
- Maks én gull-CTA i syne om gangen.

## Åpne valg til Kristian
1. **Hero-inngang til Hub:** egen «Discover»-lenke under hero-CTA, eller en liten meny/ikon øverst? (anbefaling: rolig script-lenke «Explore the coast» rett under gull-CTA)
2. **Sticky bunn-CTA på mobil** på landingen — ja? (anbefaling: ja, for booking)
3. **Tomme dashboard-seksjoner** (Turer/Kvitteringer/Andre reiser/Andre land): bygge enkle ekte visninger nå, eller rolige «kommer snart»-tilstander til dataen finnes? (anbefaling: tom-tilstander nå)

# 🧭 AUDIT — IA / LOGIKK (Monterosso landing + undersider)

> Auditør: IA/LOGIKK-lane. Kun kartlegging av FLYT og KNAPP-LOGIKK (ikke farger/pixel).
> Lest: `MÅL.md`, `COORDINATION.md`. Gjennomgått: `Landing.js`, `VillagePage.js`, `Signpost.js`,
> `villageData.js`, alle `app/(content)/**`, `app/page.js`, `layout.js`, `sitemap.js`.
> Dato: 2026-06-21.

---

## 1) TO ATSKILTE UNIVERS (kjernefunn)

Det finnes **to helt separate navigasjons-verdener** som nesten ikke snakker sammen:

- **VERDEN A — Landing (`/`)**: én React-side med 7 overlays (popups) styrt av `useState`.
  Ingen URL endres. Alt skjer på samme rute.
- **VERDEN B — SEO/innhold (`app/(content)/**`)**: 8 ekte `/`-ruter (egne sider, egne URL-er),
  hver med JSON-LD, kilder, egen `content.css`.

**Koblingen mellom dem er enveis og grov:** Alle SEO-sider lenker til `/` («The sea tour →» /
«See the private sea tour»). Det laster bare landing-HEROen — IKKE bookingen, IKKE
landsby-siden brukeren nettopp leste. Landing-overlayene lenker **aldri** ut til SEO-sidene.
En bruker som leser `/cinque-terre/vernazza` og klikker «The sea tour» havner på hero og må
finne booking på nytt. **De to verdenene overlapper i innhold (landsbyer finnes BEGGE steder)
men er ikke koblet logisk.**

---

## 2) HUB-AND-SPOKE-KART

### Verden A — Landing (`/`), overlay-graf

```
                         ┌─────────────────────────────┐
                         │   HERO  (skjerm 1)           │
                         │   CTA: "Come aboard"         │
                         │   scroll/swipe ↓             │
                         └──────────────┬──────────────┘
                                        │ (Come aboard / scroll / swipe)
                                        ▼
                              ┌───────────────────┐
                              │  BOOKING overlay  │  (kvittering → Continue →
                              │  receipt-først    │   WhatsApp/e-post → bekreftelse)
                              └───────────────────┘
   Scenen (alltid synlig bak hero, IKKE bak overlays):
     • Signpost (5 landsby-skilt)  ──► VILLAGE overlay (idx 0–4)
     • ClockTower (Vernazza-klokke) ─► VILLAGE overlay (idx 1)

   ── HUB ("Explore") — det egentlige navet, men SKJULT bak en knapp ──
        nås KUN via "Explore"-knappen inne i en undersides footer.
        Aldri direkte fra hero.

   HUB ──► News  ──► Boat ──► Booking ──► Captain ──► Customer service
```

**Overlay-inventar (Verden A):**

| Overlay | Hvordan DIT | Tilbake / videre |
|---|---|---|
| Booking | Hero-CTA, scroll/swipe, Hub-tile, fra Boat/News/CS «back to booking» | ✕, klikk-utenfor, Esc |
| Village (0–4) | Signpost-skilt, ClockTower, News «The five villages» | prev/next mellom landsbyer, «The boat →», «Explore», CS, ✕/Esc |
| Boat | Hub-tile, Village «The boat →», Captain «Aboard the Paolona» | «Come aboard →» (booking), «Explore» (hub), CS, «← The five villages», ✕/Esc |
| Hub («Explore») | «Explore»-knapp i Village/Boat/Captain/News footer | 5 tiles, ✕/Esc |
| Captain | Hub-tile, Boat «Meet him…» (kun tekst, ikke lenke!) | «Aboard the Paolona →», «Explore», CS, «← Explore», ✕/Esc |
| News | Hub-tile | «The five villages →», «Explore», CS, «← Explore», ✕/Esc |
| Customer service | «Customer service ›»-lenke i alle footers, Hub-tile | WhatsApp/tlf/e-post, «Back to booking», «← Explore», ✕/Esc |

### Verden B — SEO (`app/(content)`), side-graf

```
   /guide  (HUB for innhold — 8 kort)
      ├─► /monterosso ──► /monterosso/beaches
      │                └─► /monterosso/restaurants
      ├─► /cinque-terre-by-boat
      ├─► /cinque-terre/vernazza
      ├─► /cinque-terre/corniglia
      ├─► /cinque-terre/manarola
      └─► /cinque-terre/riomaggiore

   Hver side: topp-nav «brand → /» + «The sea tour → /»;
              bunn-CTA «See the private sea tour → /»;
              landsby/by-sider: «content__links» til hverandre + «The full guide →».
   ALLE «tilbake til produkt»-lenker peker til /  (hero), aldri til booking/overlay.
```

---

## 3) PRIORITERT LISTE — LOGIKK-HULL

### 🔴 P1 — Blindveier / forvirring

**P1-1. SEO → produkt er en blindvei mot hero, ikke mot booking.**
Alle 8 SEO-sider sender «The sea tour →» og «See the private sea tour» til `/`. Det laster
HEROen, og brukeren må scrolle/klikke «Come aboard» på nytt for å booke. En motivert leser
(«ja, jeg vil ha denne turen») mister momentum.
*Forslag:* la SEO-CTA-ene peke til `/?book=1` (eller `/#book`) og la `Landing.js` lese den
query/hash i en `useEffect` og åpne booking-overlayet automatisk. Da blir SEO → booking ett
klikk, og nordstjernen («~3 tap») holder også for SEO-trafikk.

**P1-2. Hub («Explore») — selve navet — er uoppdagbart fra hero.**
Hub er designet som «alt på ett sted» (MÅL: News·Boat·Booking·Captain·CS), men den eneste
veien inn er en liten «Explore»-knapp som først dukker opp INNE i en undersides footer. Fra
hero finnes ingen vei til Hub, Captain, News eller CS — bare «Come aboard» (booking) og
landsby-skiltene i scenen. En bruker som ikke gjetter at skiltene er klikkbare, ser aldri
80 % av innholdet.
*Forslag:* gi hero en stillferdig sekundær vei inn til Hub (f.eks. en «Explore»-script-lenke
under CTA, samme ord/type som ellers), slik at navet er nåbart fra start. Behold «én knapp =
booking» som primær, men gjør resten oppdagbart.

**P1-3. Captain-siden nås tekstuelt men ikke som lenke fra Boat.**
Boat-overlayet sier «Meet him on the captain's page.» — men det er ren tekst uten knapp.
Captain nås derfor KUN via Hub-tile. Omvendt har Captain en knapp til Boat. Asymmetrisk og
en mild blindvei (teksten lover en lenke som ikke finnes).
*Forslag:* gjør «the captain's page» til en faktisk knapp/lenke som åpner Captain-overlayet.

**P1-4. Landsby-sidene finnes i BEGGE verdener med ulik dybde — forvirrende dublett.**
Vernazza finnes som (a) landing-overlay (`villageData.js`, kort, prev/next, «The boat»),
og (b) full SEO-side `/cinque-terre/vernazza` (lang, kilder). De er ikke koblet: overlayet
peker ikke til SEO-siden, SEO-siden peker ikke til overlayet. Bruker kan lese to forskjellige
«Vernazza»-sider uten å vite at den andre finnes, eller tro at den ene er «alt».
*Forslag:* bestem ÉN primær rolle per nivå. Enten (i) la landing-overlayet ha en «Read the
full guide ↗»-lenke til SEO-siden (kobler verdenene), eller (ii) dropp overlay-teksten og la
landsby-skilt åpne SEO-siden direkte. Ikke to halv-overlappende sannheter.

### 🟠 P2 — Inkonsistens (samme handling, ulikt ord/sted/type)

**P2-1. «Tilbake»-logikken er inkonsistent mellom overlays.**
- Village: topp-nav er prev/next (sideveis), ingen «← tilbake til scene».
- Boat: bunn-nav «← The five villages» (hopper til Village idx 0).
- Captain/News/CS: bunn-nav «← Explore» (tilbake til Hub).
Tre ulike «tilbake»-mål (scene / annen side / hub) med samme visuelle plassering. Bruker vet
ikke hvor «←» fører.
*Forslag:* én regel: «←» nederst går alltid til forrige nivå (Hub hvis man kom fra Hub, ellers
lukk til scene). Eller alltid «← Explore» som konsistent hjemvei + ✕ for «lukk til scene».

**P2-2. Primær-CTA-ETIKETT for «book» varierer.**
Hero: «Come aboard». Boat: «Come aboard →». Village: «The boat →» (IKKE booking — går til Boat).
Hub-tile: «Booking». News: «The five villages →». Samme posisjon (gull-CTA), men noen ganger
booking, noen ganger navigasjon. «Come aboard» betyr book to steder, men på Village betyr
gull-CTA «gå til båt». Inkonsekvent hva den primære handlingen ER per side.
*Forslag:* hold gull-CTA = «den primære fremover-handlingen», men vær konsekvent: hvis booking
er sluttmålet overalt, bør hver sides gull-CTA enten booke eller tydelig lede ett steg mot
booking, med forutsigbar etikett.

**P2-3. To «Explore»-er med ulik betydning.**
I Verden A er «Explore» = åpne Hub-overlay. På landing-hero finnes ingen «Explore». I Verden B
har `/guide` overskriften «Explore the guide». Samme ord, to ulike nav (overlay-hub vs
SEO-hub). Mild forvirring hvis de noen gang kobles.
*Forslag:* hvis verdenene kobles (P1-1), skill ordbruken: «Explore» (landing-hub) vs «Guide»
(SEO). Ett ord = én ting.

**P2-4. Booking nås på 6+ ulike måter med ulik etikett.**
Hero «Come aboard», scroll, swipe, Hub «Booking», Boat «Come aboard →», News→Village→Boat,
CS «Back to booking». Bra at den er nåbar overalt, men etiketten er ikke konsekvent (Come
aboard / Booking / Back to booking).
*Forslag:* standardiser primær book-etikett til «Come aboard» overalt; «Back to booking»/
«Booking» kun der det semantisk er en retur.

### 🟡 P3 — Finpuss

**P3-1. Ingen vei fra landing-scene til SEO-guiden.**
Landing nevner aldri at det finnes en rik tekstguide (`/guide`, 8 sider). SEO-trafikk finner
landing, men landing-trafikk finner aldri SEO-innholdet. Tap av engasjement/SEO-intern-lenking.
*Forslag:* legg en stille «Read the guide ↗»-lenke i Hub eller News som peker til `/guide`.

**P3-2. ClockTower åpner Vernazza-overlay uten kontekst.**
Klikk på klokketårnet → Village idx 1 (Vernazza). Logisk for den som vet at klokka ER
Vernazzas, men uventet ellers. Lavt problem (villageData forklarer koblingen i teksten).
*Forslag:* behold; evt. liten aria/tooltip «Vernazza's clock — read about the village».

**P3-3. Esc lukker alt, men «klikk-utenfor» finnes ikke for noen indre handlinger.**
Konsistent nok (alle overlays har ✕ + klikk-utenfor + Esc). Ingen reell feil — nevnt for
fullstendighet: bekreftelses-skjermen («Finish») lukker IKKE overlayet, den nullstiller bare
state; bruker må så klikke ✕/utenfor. Liten dobbelt-handling på slutten av booking.
*Forslag:* la «Finish» også lukke booking-overlayet (sett `showBook=false`).

**P3-4. Sitemap utelater `/` sine overlays (forventet) men `/guide` er ikke lenket fra landing.**
Sitemap er korrekt (lister bare ekte ruter). Men siden landing aldri lenker til `/guide`,
får SEO-hubben kun ekstern/sitemap-oppdagelse, ikke intern fra hovedsiden. Kobles til P3-1.

---

## 4) OPPSUMMERING — de 6 viktigste hullene

1. **SEO → booking er en blindvei mot hero** (P1-1): alle undersider sender deg til `/`, ikke
   inn i bookingen. Fiks: `/?book=1` som auto-åpner overlayet.
2. **Hub («Explore») er navet, men er uoppdagbart fra hero** (P1-2): 80 % av innholdet (News,
   Captain, CS) er kun nåbart via en knapp gjemt i en undersides footer.
3. **De to verdenene (overlays vs SEO-ruter) er ikke koblet** (P1-4): landsbyer finnes dobbelt,
   uten lenke mellom kort-versjon og full guide — forvirrende dublett.
4. **«Tilbake» betyr tre ulike ting** på samme plass (P2-1): scene / annen side / Hub.
5. **Primær gull-CTA er inkonsekvent** (P2-2): noen ganger «book», noen ganger «naviger»
   (Village «The boat →» vs Hero «Come aboard»).
6. **Captain loves som lenke men er ren tekst** (P1-3): Boat sier «the captain's page» uten
   knapp; Captain nås kun via Hub.

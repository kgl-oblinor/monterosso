# Monterosso · Cinque Terre

Salgs-/bookingside for en sjøtur fra Monterosso al Mare (Cinque Terre).
Samlet i to versjoner:

| Mappe | Hva det er |
| --- | --- |
| [`cinque-terre/`](cinque-terre/) | **Hovedversjonen.** Next.js 15 / React 19-app med ekte online booking og betaling via Stripe Checkout (EUR), 3D-båt (Three.js), de fem landsbyene som SVG-skyline, og dag/natt-modus. Se [`cinque-terre/README.md`](cinque-terre/README.md). |
| [`onda-html/`](onda-html/) | **Forgjengeren «ONDA».** Én frittstående `index.html` uten byggesteg — booking = ring/tekst telefonnummer. Åpnes direkte i nettleser. |

## Kom i gang (hovedversjonen)

```bash
cd cinque-terre
npm install
cp .env.local.example .env.local   # fyll inn STRIPE_SECRET_KEY
npm run dev
```

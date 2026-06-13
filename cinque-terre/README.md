# Monterosso · Cinque Terre 🌊

Booking-plattform for **Monterosso sea tour** (Cinque Terre) — med
ekte online booking og betaling via **Stripe Checkout**.

Bygget med Next.js (App Router). Én tur, betaling i euro.

## Kom i gang

1. **Installer**

   ```bash
   npm install
   ```

2. **Stripe-nøkkel**

   ```bash
   cp .env.local.example .env.local
   ```

   Fyll inn din test-nøkkel fra [Stripe](https://dashboard.stripe.com/apikeys):

   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Kjør**

   ```bash
   npm run dev
   ```

   → http://localhost:3000

## Teste betaling

Stripes testkort i checkout: `4242 4242 4242 4242`, fremtidig dato, valgfri CVC.
Ingen ekte penger trekkes med test-nøkler.

## Slik henger det sammen

| Fil | Rolle |
| --- | --- |
| `lib/tour.js` | Turen + pris, varighet, maks gjester, telefon |
| `app/Landing.js` | Hele forsiden (design + animasjoner + booking-skjema) |
| `app/globals.css` | Designsystemet |
| `app/api/checkout/route.js` | Lager Stripe Checkout-session (EUR) |
| `app/success` / `app/cancel` | Sider etter betaling |

## Endre turen

Rediger `lib/tour.js` — pris (`priceEur`), maks gjester (`maxGuests`),
varighet, telefonnummer.

## Status / neste steg

v1 = fungerende online betaling. Ikke med ennå (bevisst): database/
plass-tilgjengelighet («utsolgt»), e-postbekreftelse til kunden, admin-oversikt,
flerspråk (EN/IT). Legges til ved behov.

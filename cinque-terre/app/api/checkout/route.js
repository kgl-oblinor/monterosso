import Stripe from "stripe";
import { tour } from "../../../lib/tour";

export async function POST(request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      { error: "Stripe er ikke konfigurert (mangler STRIPE_SECRET_KEY)." },
      { status: 500 }
    );
  }

  const { date, guests } = await request.json();

  // Valider dato (YYYY-MM-DD) og at den ikke er i fortiden.
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date." }, { status: 400 });
  }
  const today = new Date().toLocaleDateString("sv-SE");
  if (date < today) {
    return Response.json({ error: "Pick a date in the future." }, { status: 400 });
  }

  // Valider antall gjester (1 .. maxGuests).
  const guestCount = Number(guests);
  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > tour.maxGuests
  ) {
    return Response.json(
      { error: `Guests must be between 1 and ${tour.maxGuests}.` },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  // Fetch-based HTTP client so it runs on Cloudflare Workers as well as Node.
  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: guestCount,
          price_data: {
            currency: "eur",
            unit_amount: tour.priceEur * 100,
            product_data: {
              name: tour.name,
              description: `${tour.description} — Date: ${date}`,
            },
          },
        },
      ],
      metadata: {
        trip_date: date,
        guests: String(guestCount),
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: "Could not start payment." },
      { status: 500 }
    );
  }
}

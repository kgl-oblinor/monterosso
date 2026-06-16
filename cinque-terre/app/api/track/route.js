import { getCloudflareContext } from "@opennextjs/cloudflare";

// Logs lightweight events to D1: page visits and which contact channel a
// guest started (whatsapp / sms / call) with their reservation code.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = String(body.type || "").slice(0, 20);
    if (!["visit", "whatsapp", "sms", "call", "lead"].includes(type)) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const { env, cf } = getCloudflareContext();
    const db = env?.DB;
    if (!db) return Response.json({ ok: true }); // local dev: no binding → no-op

    const code = body.code ? String(body.code).slice(0, 40) : null;
    const dato = body.dato ? String(body.dato).slice(0, 40) : null;
    const guests = Number.isFinite(+body.guests) ? +body.guests : null;
    const city = (cf?.city || "").toString().slice(0, 80);
    const country = (cf?.country || "").toString().slice(0, 8);
    const phone = body.phone ? String(body.phone).slice(0, 40) : null;
    const email = body.email ? String(body.email).slice(0, 120) : null;
    const slot = body.slot ? String(body.slot).slice(0, 20) : null;
    const boarding = body.boarding ? String(body.boarding).slice(0, 8) : null;

    await db
      .prepare(
        "INSERT INTO events (type, code, dato, guests, city, country, ts, phone, email, slot, boarding) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
      )
      .bind(
        type,
        code,
        dato,
        guests,
        city,
        country,
        new Date().toISOString(),
        phone,
        email,
        slot,
        boarding
      )
      .run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true }); // never break the page over analytics
  }
}

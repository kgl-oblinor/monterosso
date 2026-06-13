import { getCloudflareContext } from "@opennextjs/cloudflare";

// Logs lightweight events to D1: page visits and which contact channel a
// guest started (whatsapp / sms / call) with their reservation code.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = String(body.type || "").slice(0, 20);
    if (!["visit", "whatsapp", "sms", "call"].includes(type)) {
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

    await db
      .prepare(
        "INSERT INTO events (type, code, dato, guests, city, country, ts) VALUES (?,?,?,?,?,?,?)"
      )
      .bind(type, code, dato, guests, city, country, new Date().toISOString())
      .run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true }); // never break the page over analytics
  }
}

// Onboarding API — the only barrier is one contact: email OR phone.
// No verification code, no password. POST { email?, phone? } -> creates (or
// reuses) a light user in our own D1. Local dev (no D1) returns ok with a stub.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createUser, findUser } from "../../../lib/db";
import { isValidEmail, normalizePhone } from "../../../lib/auth.js";

function getDB() {
  try {
    return getCloudflareContext()?.env?.DB ?? null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = body.email ? String(body.email).trim() : "";
  const phone = body.phone ? String(body.phone).trim() : "";

  const e = email && isValidEmail(email) ? email.toLowerCase() : null;
  const p = phone ? normalizePhone(phone) : null;
  if (!e && !p) {
    return Response.json(
      { ok: false, error: "Add a valid email or phone number — either one is enough." },
      { status: 400 }
    );
  }

  const db = getDB();
  if (!db) {
    // local dev: no binding → pretend success so the flow is testable
    return Response.json({ ok: true, user: { id: crypto.randomUUID(), email: e, phone: p } });
  }

  // reuse an existing light user if this contact is already known
  let user =
    (e && (await findUser(db, { email: e }))) ||
    (p && (await findUser(db, { phone: p }))) ||
    null;
  if (!user) user = await createUser(db, { email: e, phone: p });

  return Response.json({ ok: true, user: { id: user.id, email: user.email, phone: user.phone } });
}

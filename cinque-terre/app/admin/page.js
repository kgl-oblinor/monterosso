import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Monterosso" };

function fmt(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

const CHAN = { whatsapp: "WhatsApp", sms: "SMS", call: "Ring", lead: "Lead" };

export default async function Admin({ searchParams }) {
  const sp = (await searchParams) || {};
  const key = sp.key || "";

  let env;
  try {
    ({ env } = getCloudflareContext());
  } catch {
    env = null;
  }
  const adminKey = env?.ADMIN_KEY;
  const authed = !!adminKey && key === adminKey;

  if (!authed) {
    return (
      <main className="admin admin--login">
        <form className="admin-login" method="GET">
          <h1>Admin</h1>
          <input name="key" type="password" placeholder="Passord" autoFocus />
          <button type="submit">Logg inn</button>
          {key && adminKey ? <p className="admin-err">Feil passord.</p> : null}
          {!adminKey ? (
            <p className="admin-err">Kjør på den deployede siden (Cloudflare).</p>
          ) : null}
        </form>
      </main>
    );
  }

  let visits = 0;
  let today = 0;
  let msgs = [];
  if (env?.DB) {
    const db = env.DB;
    const since = new Date(Date.now() - 86400000).toISOString();
    const v = await db
      .prepare("SELECT COUNT(*) AS n FROM events WHERE type='visit'")
      .first();
    visits = v?.n || 0;
    const vt = await db
      .prepare("SELECT COUNT(*) AS n FROM events WHERE type='visit' AND ts >= ?")
      .bind(since)
      .first();
    today = vt?.n || 0;
    const r = await db
      .prepare(
        "SELECT type, code, dato, guests, city, country, ts, phone, email FROM events WHERE type IN ('whatsapp','sms','call','lead') ORDER BY id DESC LIMIT 200"
      )
      .all();
    msgs = r?.results || [];
  }

  return (
    <main className="admin">
      <h1>Monterosso · Admin</h1>
      <div className="admin-cards">
        <div className="admin-card">
          <span className="admin-card__n">{visits}</span>
          <span className="admin-card__l">Besøk totalt</span>
        </div>
        <div className="admin-card">
          <span className="admin-card__n">{today}</span>
          <span className="admin-card__l">Besøk siste 24t</span>
        </div>
        <div className="admin-card">
          <span className="admin-card__n">{msgs.length}</span>
          <span className="admin-card__l">Henvendelser</span>
        </div>
      </div>

      <h2>Henvendelser</h2>
      {msgs.length === 0 ? (
        <p className="admin-empty">Ingen henvendelser ennå.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tid</th>
              <th>Kanal</th>
              <th>Kode</th>
              <th>Dato</th>
              <th>Gjester</th>
              <th>Kontakt</th>
              <th>Sted</th>
            </tr>
          </thead>
          <tbody>
            {msgs.map((m, i) => (
              <tr key={i}>
                <td>{fmt(m.ts)}</td>
                <td>
                  <span className={"chan chan--" + m.type}>
                    {CHAN[m.type] || m.type}
                  </span>
                </td>
                <td className="mono">{m.code || "—"}</td>
                <td>{m.dato || "—"}</td>
                <td>{m.guests ?? "—"}</td>
                <td>
                  {[m.phone, m.email].filter(Boolean).join(" · ") || "—"}
                </td>
                <td>
                  {[m.city, m.country].filter(Boolean).join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

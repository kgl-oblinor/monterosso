// Monterosso hub — a single password-gated index linking our live pages.
// Password only (no username). Password lives in the HUB_PASSWORD secret.

const COOKIE = "hub_ok";
const SALT = "monterosso-hub-v1";

const LINKS = [
  { title: "Landingen", note: "Den nye, perfeksjonerte forsiden", href: "https://monterosso-cinque-terre-v2.kgl-56a.workers.dev" },
  { title: "Dashboard", note: "Kunde & skipper — chat og turer", href: "https://monterosso-app.kgl-56a.workers.dev" },
  { title: "Admin", note: "Ditt kontrollpanel (skippere, kunder, samtaler)", href: "https://monterosso-app.kgl-56a.workers.dev/admin/login" },
  { title: "Chat-API", note: "Teknisk status for chat-tjenesten", href: "https://monterosso-chat.kgl-56a.workers.dev/health" },
];

async function tokenFor(pass) {
  const data = new TextEncoder().encode(pass + SALT);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

const page = (body) => `<!doctype html><html lang="no"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Monterosso</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Limelight&display=swap" rel="stylesheet">
<style>
  :root{--ink:#07182a;--cream:#f7f1e3;--sand:#efe7d4;--gold:#ead27e;--terra:#a8743f}
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100svh;background:var(--sand);color:var(--ink);font-family:"Fraunces",Georgia,serif;
       display:flex;align-items:center;justify-content:center;padding:24px}
  .wrap{width:100%;max-width:560px}
  .eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:13px;color:var(--terra);text-align:center;margin-bottom:8px}
  h1{font-size:33px;font-weight:600;text-align:center;letter-spacing:.02em;margin-bottom:24px}
  .card{background:var(--cream);box-shadow:0 30px 80px rgba(2,10,20,.25);padding:32px}
  /* gold ticket: ink text + ink border (research-verified) */
  .cta{display:block;width:100%;background:var(--gold);color:var(--ink);border:2px solid var(--ink);
       font-family:"Limelight",serif;letter-spacing:.08em;font-size:16px;padding:16px;cursor:pointer;text-align:center}
  .cta:hover{opacity:.94}
  input{width:100%;background:#fff;border:2px solid var(--ink);color:var(--ink);font-family:inherit;
        font-size:19px;padding:14px 16px;margin-bottom:16px;letter-spacing:.18em;text-align:center}
  input:focus{outline:none;border-color:var(--terra)}
  .err{color:var(--terra);text-align:center;margin-top:16px;font-size:15px;min-height:20px}
  .grid{display:grid;gap:16px}
  a.tile{display:block;background:var(--cream);box-shadow:0 18px 50px rgba(2,10,20,.18);
         padding:24px;text-decoration:none;color:var(--ink);border-left:4px solid var(--gold);transition:transform .12s}
  a.tile:hover{transform:translateY(-2px)}
  a.tile .t{font-size:23px;font-weight:600}
  a.tile .n{font-size:15px;color:rgba(7,24,42,.62);margin-top:4px}
  .arrow{float:right;color:var(--terra);font-size:23px}
</style></head><body><div class="wrap">${body}</div></body></html>`;

const loginPage = (error) => page(`
  <p class="eyebrow">Monterosso · Cinque Terre</p>
  <h1>Velkommen</h1>
  <form class="card" method="POST" autocomplete="off">
    <input type="password" name="password" placeholder="passord" autofocus aria-label="Passord">
    <button class="cta" type="submit">Continue</button>
    <p class="err">${error ? "Feil passord." : ""}</p>
  </form>`);

const hubPage = () => page(`
  <p class="eyebrow">Monterosso · Cinque Terre</p>
  <h1>Våre sider</h1>
  <div class="grid">
    ${LINKS.map((l) => `<a class="tile" href="${l.href}" target="_blank" rel="noopener">
      <span class="arrow">→</span><div class="t">${l.title}</div><div class="n">${l.note}</div></a>`).join("")}
  </div>`);

const htmlResponse = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { "content-type": "text/html;charset=utf-8", ...headers } });

export default {
  async fetch(req, env) {
    const pass = env.HUB_PASSWORD || "220288";
    const token = await tokenFor(pass);

    if (req.method === "POST") {
      const form = await req.formData();
      if (String(form.get("password") || "") === pass) {
        return new Response(null, {
          status: 303,
          headers: {
            Location: "/",
            "Set-Cookie": `${COOKIE}=${token}; HttpOnly; Secure; Path=/; Max-Age=2592000; SameSite=Lax`,
          },
        });
      }
      return htmlResponse(loginPage(true), 401);
    }

    const authed = parseCookies(req.headers.get("cookie"))[COOKIE] === token;
    return htmlResponse(authed ? hubPage() : loginPage(false));
  },
};

// Monterosso hub — a single password-gated index linking our live pages.
// Password only (no username). Password in HUB_PASSWORD secret. The credentials
// shown on tiles (admin email/password) come from secrets too, never the repo.

const COOKIE = "hub_ok";
const SALT = "monterosso-hub-v1";

// Tiles. `creds` is filled from env at render time (kept out of the repo).
const LINKS = [
  { key: "landing", title: "Landingen", note: "Den nye, perfeksjonerte forsiden", href: "https://monterosso-cinque-terre-v2.kgl-56a.workers.dev" },
  { key: "app", title: "Dashboard", note: "Kunde & skipper — chat og turer", href: "https://monterosso-app.kgl-56a.workers.dev" },
  { key: "admin", title: "Admin", note: "Ditt kontrollpanel (skippere, kunder, samtaler)", href: "https://monterosso-app.kgl-56a.workers.dev/admin/login" },
  { key: "api", title: "Chat-API", note: "Teknisk status for chat-tjenesten", href: "https://monterosso-chat.kgl-56a.workers.dev/health" },
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

// Credentials per tile, sourced from env secrets.
function credsFor(key, env) {
  if (key === "admin") {
    return [
      { label: "E-post", value: env.ADMIN_EMAIL || "kgl@oblinor.no" },
      { label: "Passord", value: env.ADMIN_PW || "" },
    ].filter((c) => c.value);
  }
  return [];
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
  .cta{display:block;width:100%;background:var(--gold);color:var(--ink);border:2px solid var(--ink);
       font-family:"Limelight",serif;letter-spacing:.08em;font-size:16px;padding:16px;cursor:pointer;text-align:center}
  .cta:hover{opacity:.94}
  input{width:100%;background:#fff;border:2px solid var(--ink);color:var(--ink);font-family:inherit;
        font-size:19px;padding:14px 16px;margin-bottom:16px;letter-spacing:.18em;text-align:center}
  input:focus{outline:none;border-color:var(--terra)}
  .err{color:var(--terra);text-align:center;margin-top:16px;font-size:15px;min-height:20px}
  .grid{display:grid;gap:16px}
  .tile{background:var(--cream);box-shadow:0 18px 50px rgba(2,10,20,.18);border-left:4px solid var(--gold)}
  .tile-head{display:block;padding:24px;text-decoration:none;color:var(--ink);transition:transform .12s}
  .tile-head:hover{transform:translateY(-2px)}
  .tile-head .arrow{float:right;color:var(--terra);font-size:23px}
  .tile-head .t{font-size:23px;font-weight:600}
  .tile-head .n{font-size:15px;color:rgba(7,24,42,.62);margin-top:4px}
  .creds{border-top:2px solid rgba(7,24,42,.12);padding:16px 24px;display:grid;gap:8px}
  .cred{display:flex;align-items:center;gap:12px}
  .cred .lab{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--terra);min-width:64px}
  .cred code{flex:1;font-family:"Fraunces",serif;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .copy{background:var(--ink);color:var(--cream);border:none;font-family:"Fraunces",serif;font-size:13px;
        letter-spacing:.06em;padding:8px 14px;cursor:pointer}
  .copy:hover{background:#0f2740}
  .copy.done{background:var(--terra)}
</style></head><body><div class="wrap">${body}</div></body></html>`;

const loginPage = (error) => page(`
  <p class="eyebrow">Monterosso · Cinque Terre</p>
  <h1>Velkommen</h1>
  <form class="card" method="POST" autocomplete="off">
    <input type="password" name="password" placeholder="passord" autofocus aria-label="Passord">
    <button class="cta" type="submit">Continue</button>
    <p class="err">${error ? "Feil passord." : ""}</p>
  </form>`);

const tile = (l, env) => {
  const creds = credsFor(l.key, env);
  const credsHtml = creds.length
    ? `<div class="creds">${creds
        .map((c) => `<div class="cred"><span class="lab">${esc(c.label)}</span><code>${esc(c.value)}</code>
          <button class="copy" type="button" data-copy="${esc(c.value)}">Kopier</button></div>`)
        .join("")}</div>`
    : "";
  return `<div class="tile">
    <a class="tile-head" href="${esc(l.href)}" target="_blank" rel="noopener">
      <span class="arrow">→</span><div class="t">${esc(l.title)}</div><div class="n">${esc(l.note)}</div>
    </a>${credsHtml}</div>`;
};

const hubPage = (env) => page(`
  <p class="eyebrow">Monterosso · Cinque Terre</p>
  <h1>Våre sider</h1>
  <div class="grid">${LINKS.map((l) => tile(l, env)).join("")}</div>
  <script>
    document.querySelectorAll(".copy").forEach((b)=>b.addEventListener("click",async()=>{
      try{await navigator.clipboard.writeText(b.dataset.copy);const o=b.textContent;
        b.textContent="Kopiert ✓";b.classList.add("done");
        setTimeout(()=>{b.textContent=o;b.classList.remove("done")},1200);}catch(e){}
    }));
  </script>`);

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
    return htmlResponse(authed ? hubPage(env) : loginPage(false));
  },
};

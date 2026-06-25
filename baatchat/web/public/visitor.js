/*
 * visitor.js — anonymt førsteparts-besøkende-håndtak for Monterosso ("Uber for båter", Cinque Terre-pilot)
 *
 * Mål: fange de aller første brukerne fra første sekund, på ALLE enheter (Android / iOS / desktop),
 * og holde et stabilt anonymt ID som live-kartet senere henger posisjon + rolle på.
 *
 * Robusthet på tvers av enheter:
 *  - crypto.randomUUID() med RFC4122-fallback (eldre nettlesere) og siste nød-fallback.
 *  - iOS Safari (ITP) kapper JS-satte cookies til ~7 dager → vi SPEILER ID-et i localStorage
 *    og gjenoppretter det om cookien blir kappet. (I PWA/native app blir lagringen varig av seg selv.)
 *  - Ingen tredjeparter, ingen PII. Kun en anonym ID + tidspunkt + kilde.
 */
(function () {
  var NAME = "cinque_visitor";
  var ONE_YEAR = 60 * 60 * 24 * 365;

  function uuid() {
    try {
      if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
      if (window.crypto && typeof crypto.getRandomValues === "function") {
        var b = crypto.getRandomValues(new Uint8Array(16));
        b[6] = (b[6] & 0x0f) | 0x40; // versjon 4
        b[8] = (b[8] & 0x3f) | 0x80; // variant
        var h = [];
        for (var i = 0; i < 16; i++) h.push((b[i] + 0x100).toString(16).slice(1));
        return (
          h.slice(0, 4).join("") + "-" + h.slice(4, 6).join("") + "-" +
          h.slice(6, 8).join("") + "-" + h.slice(8, 10).join("") + "-" + h.slice(10, 16).join("")
        );
      }
    } catch (e) {}
    return "v-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function readCookie(name) {
    var m = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
    return m ? decodeURIComponent(m[1]) : null;
  }

  function writeCookie(name, value) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      name + "=" + encodeURIComponent(value) +
      "; Max-Age=" + ONE_YEAR + "; Path=/; SameSite=Lax" + secure;
  }

  function load() {
    var raw = readCookie(NAME);
    if (!raw) { try { raw = localStorage.getItem(NAME); } catch (e) {} }
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    return null;
  }

  function save(v) {
    var s = JSON.stringify(v);
    writeCookie(NAME, s);                       // cookie (sendes til serveren)
    try { localStorage.setItem(NAME, s); } catch (e) {} // speil (overlever ITP-kapping)
  }

  var v = load();
  if (!v || !v.id) {
    v = {
      id: uuid(),
      firstSeen: new Date().toISOString(),
      referrer: document.referrer || null,
      landing: location.host,   // hvilken av landingssidene de først kom til
      role: "unknown"           // settes til "customer"/"skipper" når vi vet det
    };
  }

  // Fang kampanje-kilde hvis den finnes (utm_source / ref), kun første gang
  try {
    var p = new URLSearchParams(location.search);
    var src = p.get("utm_source") || p.get("ref");
    if (src && !v.utmSource) v.utmSource = src;
  } catch (e) {}

  v.lastSeen = new Date().toISOString();
  save(v); // fornyer alltid levetiden

  // Lite API som resten av appen (og live-kartet) bruker senere:
  window.cinqueVisitor = {
    id: v.id,
    data: v,
    setRole: function (role) { v.role = role; save(v); },
    // Posisjonen henges på her når brukeren har gitt stedtjeneste-tillatelse (steg 2)
    setLocation: function (lat, lng) { v.lat = lat; v.lng = lng; v.locAt = new Date().toISOString(); save(v); }
  };
})();

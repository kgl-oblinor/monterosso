"use client";

import { useEffect, useRef, useState } from "react";
import { tour } from "../lib/tour";
import Skyline from "./Skyline";
import Boat3D from "./Boat3D";

export default function Landing() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  return (
    <>
      <Effects />

      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Bytt lys/mørk modus"
      >
        {theme === "light" ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="progress" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>
      <div className="cursor" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>

      <div id="loader" aria-hidden="true">
        <div className="loader-lockup">
          <div className="loader-word">
            <span>M</span>
            <span>O</span>
            <span>N</span>
            <span>T</span>
            <span>E</span>
            <span>R</span>
            <span>O</span>
            <span>S</span>
            <span>S</span>
            <span>O</span>
          </div>
          <div className="loader-sub">Cinque Terre</div>
        </div>
      </div>

      {/* sky — upper half */}
      <div className="sky" aria-hidden="true"></div>
      <div className="stars" aria-hidden="true"></div>

      {/* living sea — lower half */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora__layer aurora__layer--a"></div>
        <div className="aurora__layer aurora__layer--b"></div>
        <div className="aurora__gloss"></div>
        <div className="aurora__vignette"></div>
      </div>
      {/* the five villages on the horizon */}
      <Skyline />

      {/* a little 3D tour boat sailing on the sea */}
      <Boat3D theme={theme} />

      <div className="shell">
        <p className="sr-only">
          We run the world's most beautiful sea tour from Monterosso al Mare in
          Cinque Terre, Italy. €{tour.priceEur} per head. Book and pay online.
        </p>

        {/* HERO */}
        <header className="hero" id="top">
          <p className="eyebrow">Monterosso al Mare · Cinque Terre</p>
          <div className="cta-wrap">
            <a className="cta" href="#book">
              Book — reserve your seat
            </a>
          </div>
          <div className="scroll-hint">
            <span>scroll</span>
            <span className="dot"></span>
          </div>
        </header>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            <span>
              Hidden coves <i className="star">✦</i> Sunset aperitivo{" "}
              <i className="star">✦</i> Crystal swim stops{" "}
              <i className="star">✦</i> Sciacchetrà &amp; anchovies{" "}
              <i className="star">✦</i> Your own skipper <i className="star">✦</i>{" "}
              Past Il Gigante <i className="star">✦</i> Punta Mesco{" "}
              <i className="star">✦</i>{" "}
            </span>
            <span>
              Hidden coves <i className="star">✦</i> Sunset aperitivo{" "}
              <i className="star">✦</i> Crystal swim stops{" "}
              <i className="star">✦</i> Sciacchetrà &amp; anchovies{" "}
              <i className="star">✦</i> Your own skipper <i className="star">✦</i>{" "}
              Past Il Gigante <i className="star">✦</i> Punta Mesco{" "}
              <i className="star">✦</i>{" "}
            </span>
          </div>
        </div>

        {/* MONTALE EPIGRAPH — Monterosso's Nobel poet, "I limoni" */}
        <p className="epigraph reveal">
          Where Montale's lemons ripen above the sea.
        </p>

        {/* ABOARD */}
        <section className="aboard" id="aboard">
          <p className="section-label reveal">What you'll live</p>
          <h2 className="section-title reveal">A day on the blue</h2>
          <div className="orb-grid">
            <div className="orb-card reveal">
              <svg viewBox="0 0 200 200">
                <defs>
                  <radialGradient id="g0" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#cffaf6" />
                    <stop offset="100%" stopColor="#4fe0d8" />
                  </radialGradient>
                </defs>
                <path className="blob-path" fill="url(#g0)" />
              </svg>
              <h3>Secret coves</h3>
              <p>where the crowds can't reach</p>
            </div>
            <div className="orb-card reveal">
              <svg viewBox="0 0 200 200">
                <defs>
                  <radialGradient id="g1" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#d6ecff" />
                    <stop offset="100%" stopColor="#5aa8ff" />
                  </radialGradient>
                </defs>
                <path className="blob-path" fill="url(#g1)" />
              </svg>
              <h3>Crystal swim stops</h3>
              <p>dive into the Ligurian sea</p>
            </div>
            <div className="orb-card reveal">
              <svg viewBox="0 0 200 200">
                <defs>
                  <radialGradient id="g2" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#fff1c9" />
                    <stop offset="100%" stopColor="#ffd874" />
                  </radialGradient>
                </defs>
                <path className="blob-path" fill="url(#g2)" />
              </svg>
              <h3>Sunset aperitivo</h3>
              <p>prosecco as the sky turns gold</p>
            </div>
            <div className="orb-card reveal">
              <svg viewBox="0 0 200 200">
                <defs>
                  <radialGradient id="g3" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#ffd9c9" />
                    <stop offset="100%" stopColor="#ff7a5e" />
                  </radialGradient>
                </defs>
                <path className="blob-path" fill="url(#g3)" />
              </svg>
              <h3>Your own skipper</h3>
              <p>born on this coast</p>
            </div>
          </div>
        </section>

        {/* BOOK */}
        <section className="book-section" id="book">
          <p className="section-label reveal">Reserve</p>
          <h2 className="section-title reveal">Book your day</h2>
          <BookingForm />
        </section>

        {/* FOOTER */}
        <footer id="footer">
          <div className="fmark">Monterosso</div>
          <div className="fmark-sub">Cinque Terre</div>
          <div className="flinks">
            <a href={`tel:${tour.phone.replace(/\s/g, "")}`}>Call</a>
            <a href={`sms:${tour.phone.replace(/\s/g, "")}`}>Text</a>
            <a href={`https://wa.me/${tour.phone.replace(/[\s+]/g, "")}`}>
              WhatsApp
            </a>
          </div>
          <p className="foot-price">
            €<b>{tour.priceEur}</b> per head &nbsp;·&nbsp; {tour.durationHours}{" "}
            hours on the Ligurian blue
          </p>
          <p className="copy">Monterosso al Mare · Cinque Terre · Liguria, Italy</p>
        </footer>
      </div>
    </>
  );
}

function BookingForm() {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("sv-SE");

  async function handlePay() {
    setError("");
    if (!date) {
      setError("Please pick a date for your tour.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, guests }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("Could not start payment. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="book-form reveal">
      <p className="meta">
        Monterosso sea tour · {tour.durationHours} hours · max {tour.maxGuests}{" "}
        guests
      </p>
      <div className="row">
        <label>
          Date
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Guests
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          >
            {Array.from({ length: tour.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="total-row">
        <span className="t-label">Total</span>
        <span className="t-val">€{tour.priceEur * guests}</span>
      </div>
      <button className="pay" onClick={handlePay} disabled={loading}>
        {loading ? "Taking you to checkout…" : "Pay & reserve"}
      </button>
      <p className="err">{error}</p>
      <p className="reassure">Secure payment via Stripe · €{tour.priceEur} / head</p>
    </div>
  );
}

/* All the original vanilla-JS effects, ported into one mount effect. */
function Effects() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against React strict-mode double-invoke
    ran.current = true;

    /* ---------- LOADER (fail-safe: never traps the page) ---------- */
    (function () {
      const l = document.getElementById("loader");
      if (!l) return;
      const hide = () => l.classList.add("done");
      addEventListener("load", () => setTimeout(hide, 900));
      setTimeout(hide, 2600);
    })();

    /* ---------- CUSTOM CURSOR ---------- */
    (function () {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const dot = document.querySelector(".cursor");
      const ring = document.querySelector(".cursor-ring");
      if (!dot || !ring) return;
      let rx = 0,
        ry = 0,
        mx = 0,
        my = 0;
      addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      });
      document.querySelectorAll("a,button,input,select").forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("grow"));
        el.addEventListener("mouseleave", () => ring.classList.remove("grow"));
      });
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
      })();
    })();

    /* ---------- SCROLL PROGRESS (fallback if no scroll-timeline) ---------- */
    if (!CSS.supports("animation-timeline", "scroll()")) {
      const bar = document.querySelector(".progress");
      if (bar) {
        const upd = () => {
          const h = document.documentElement;
          const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
          bar.style.transform = "scaleX(" + p + ")";
        };
        addEventListener("scroll", upd, { passive: true });
        addEventListener("resize", upd);
        upd();
      }
    }

    /* ---------- SCROLL REVEAL (fallback) ---------- */
    if (!CSS.supports("animation-timeline", "view()")) {
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.15 }
      );
      document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    }

    /* ---------- ORGANIC, SEAMLESSLY-LOOPING MORPHING ORB BLOBS ---------- */
    (function () {
      const TAU = Math.PI * 2;
      function noise(seed) {
        let s = seed || 1;
        const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
        const h = [1, 2, 3].map((k) => ({
          k,
          ph: r() * TAU,
          amp: (r() * 0.6 + 0.4) / k,
        }));
        const n = h.reduce((a, c) => a + c.amp, 0) || 1;
        return (th) => {
          let v = 0;
          for (const t of h) v += t.amp * Math.sin(th * t.k + t.ph);
          return v / n;
        };
      }
      function spline(p) {
        let d = `M ${p[0][0].toFixed(2)},${p[0][1].toFixed(2)} `;
        const n = p.length;
        for (let i = 0; i < n; i++) {
          const a = p[(i - 1 + n) % n],
            b = p[i],
            c = p[(i + 1) % n],
            e = p[(i + 2) % n];
          d += `C ${(b[0] + (c[0] - a[0]) / 6).toFixed(2)},${(
            b[1] +
            (c[1] - a[1]) / 6
          ).toFixed(2)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(2)},${(
            c[1] -
            (e[1] - b[1]) / 6
          ).toFixed(2)} ${c[0].toFixed(2)},${c[1].toFixed(2)} `;
        }
        return d + "Z";
      }
      const blobs = [...document.querySelectorAll(".blob-path")].map((el, i) => ({
        el,
        N: 8,
        R: 62,
        cx: 100,
        cy: 100,
        A: noise((i + 1) * 97 + 13),
        B: noise((i + 1) * 53 + 71),
        phase: (i / 4) * TAU,
      }));
      const SPEED = TAU / 1400;
      (function loop() {
        for (const b of blobs) {
          b.phase += SPEED;
          if (b.phase >= TAU) b.phase -= TAU;
          const pts = [];
          for (let k = 0; k < b.N; k++) {
            const ang = (k / b.N) * TAU;
            const nz = 0.6 * b.A(ang + b.phase) + 0.4 * b.B(ang * 2 - b.phase);
            const rad = b.R + nz * 22;
            pts.push([b.cx + Math.cos(ang) * rad, b.cy + Math.sin(ang) * rad]);
          }
          b.el.setAttribute("d", spline(pts));
        }
        requestAnimationFrame(loop);
      })();
    })();

  }, []);

  return null;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 100 100" className="celestial">
      <defs>
        <radialGradient id="sunGrad" cx="0.42" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="0.6" stopColor="#ffce4d" />
          <stop offset="1" stopColor="#ff9e2c" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x="48.4"
          y="5"
          width="3.2"
          height="12"
          rx="1.6"
          fill="#ffc23c"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="20" fill="url(#sunGrad)" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 100 100" className="celestial">
      <defs>
        <radialGradient id="moonGrad" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fdf7e3" />
          <stop offset="1" stopColor="#c9d0e0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="27" fill="url(#moonGrad)" />
      <circle cx="41" cy="44" r="5" fill="#bcc3d4" opacity="0.55" />
      <circle cx="59" cy="57" r="7" fill="#bcc3d4" opacity="0.45" />
      <circle cx="57" cy="37" r="3.4" fill="#bcc3d4" opacity="0.5" />
      <circle cx="46" cy="60" r="3" fill="#bcc3d4" opacity="0.4" />
    </svg>
  );
}

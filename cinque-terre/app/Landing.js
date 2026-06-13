"use client";

import { useEffect, useRef, useState } from "react";
import { tour } from "../lib/tour";
import Skyline from "./Skyline";
import Boat3D from "./Boat3D";
import Clouds from "./Clouds";

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
      <Clouds />

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

        {/* SCREEN 1 — HERO + RESERVE CTA */}
        <header className="hero" id="top">
          <p className="eyebrow">Monterosso al Mare</p>
          <h1>Cinque Terre</h1>
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

        {/* SCREEN 2 — BOOK */}
        <section className="book-section" id="book">
          <p className="section-label reveal">Reserve</p>
          <h2 className="section-title reveal">Book your day</h2>
          <BookingForm />
        </section>
      </div>
    </>
  );
}

function BookingForm() {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState([]);

  useEffect(() => {
    setDays(buildDays(21));
    setDate((d) => d || todayISO()); // default to today, set on the client
  }, []);

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
        <div className="field">
          <span className="field-head">
            Date
            <Stepper
              onDown={() => setDate((d) => clampToday(shiftISO(d || todayISO(), -1)))}
              onUp={() => setDate((d) => shiftISO(d || todayISO(), 1))}
            />
          </span>
          <DatePicker value={date} onChange={setDate} days={days} />
          <WheelPicker
            ariaLabel="Velg dag"
            value={date}
            onChange={setDate}
            items={days.map((d) => ({ value: d.iso, label: d.label, sub: d.small }))}
          />
        </div>
        <div className="field">
          <span className="field-head">
            Guests
            <Stepper
              onDown={() => setGuests((g) => Math.max(1, g - 1))}
              onUp={() => setGuests((g) => Math.min(tour.maxGuests, g + 1))}
            />
          </span>
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
          <WheelPicker
            ariaLabel="Antall gjester"
            value={guests}
            onChange={setGuests}
            items={Array.from({ length: tour.maxGuests }, (_, i) => ({
              value: i + 1,
              label: String(i + 1),
            }))}
          />
        </div>
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

/* Matching up/down stepper that sits above each box. */
function Stepper({ onDown, onUp }) {
  return (
    <span className="stepper">
      <button
        type="button"
        className="stepper__btn"
        onClick={onDown}
        onMouseDown={(e) => e.preventDefault()}
        aria-label="Ned"
      >
        ▾
      </button>
      <button
        type="button"
        className="stepper__btn"
        onClick={onUp}
        onMouseDown={(e) => e.preventDefault()}
        aria-label="Opp"
      >
        ▴
      </button>
    </span>
  );
}

function todayISO() {
  return new Date().toLocaleDateString("sv-SE");
}
function shiftISO(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d + n).toLocaleDateString("sv-SE");
}
function clampToday(iso) {
  const t = todayISO();
  return iso < t ? t : iso;
}

/* Friendly day picker: today / tomorrow / day-after-tomorrow, then weekdays,
   with the actual date kept small and subtle in the poster's gold. */
function buildDays(n) {
  const rel = ["I dag", "I morgen", "Overimorgen"];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      iso: d.toLocaleDateString("sv-SE"),
      label: i < 3 ? rel[i] : cap(d.toLocaleDateString("nb-NO", { weekday: "long" })),
      small: d.toLocaleDateString("nb-NO", { day: "numeric", month: "long" }),
    });
  }
  return out;
}

function DatePicker({ value, onChange, days }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const sel = days.find((d) => d.iso === value);

  return (
    <div className={"datepick" + (open ? " open" : "")} ref={ref}>
      <button
        type="button"
        className="datepick__field"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="datepick__label">{sel ? sel.label : "Velg dag"}</span>
        {sel && <span className="datepick__date">{sel.small}</span>}
        <span className="datepick__chev" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div className="datepick__menu" role="listbox">
          {days.map((d) => (
            <button
              type="button"
              key={d.iso}
              role="option"
              aria-selected={d.iso === value}
              className={"datepick__opt" + (d.iso === value ? " is-sel" : "")}
              onClick={() => {
                onChange(d.iso);
                setOpen(false);
              }}
            >
              <span>{d.label}</span>
              <span className="datepick__optdate">{d.small}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* iOS-style drum picker for touch: scroll with momentum, snap to centre,
   the centred row sits in a gold band and rows fade with distance. Used on
   mobile; desktop keeps the dropdown / select. */
const WHEEL_ITEM_H = 50;

function applyWheelDepth(el) {
  const sel = el.scrollTop / WHEEL_ITEM_H;
  el.querySelectorAll("[data-wi]").forEach((it, i) => {
    const dist = Math.min(Math.abs(i - sel), 3);
    it.style.opacity = String(Math.max(0.22, 1 - dist * 0.3));
    it.style.transform = `scale(${Math.max(0.78, 1 - dist * 0.11)})`;
  });
}

function WheelPicker({ items, value, onChange, ariaLabel }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const idx = Math.max(
    0,
    items.findIndex((it) => it.value === value)
  );

  // position on the selected row once the items exist
  useEffect(() => {
    const el = ref.current;
    if (!el || !items.length) return;
    el.scrollTop = idx * WHEEL_ITEM_H;
    applyWheelDepth(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // follow external changes (default today, the steppers, etc.)
  useEffect(() => {
    const el = ref.current;
    if (!el || !items.length) return;
    const target = idx * WHEEL_ITEM_H;
    if (Math.abs(el.scrollTop - target) > 3)
      el.scrollTo({ top: target, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items.length]);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    if (!raf.current)
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        applyWheelDepth(el);
      });
    clearTimeout(el._settle);
    el._settle = setTimeout(() => {
      const i = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_H))
      );
      if (items[i] && items[i].value !== value) onChange(items[i].value);
    }, 120);
  }

  return (
    <div className="wheel" role="listbox" aria-label={ariaLabel}>
      <div className="wheel__band" aria-hidden="true" />
      <div className="wheel__scroll" ref={ref} onScroll={onScroll}>
        {items.map((it) => (
          <div className="wheel__item" data-wi key={String(it.value)}>
            <span className="wheel__label">{it.label}</span>
            {it.sub && <span className="wheel__sub">{it.sub}</span>}
          </div>
        ))}
      </div>
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

  }, []);

  return null;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 100 100" className="celestial">
      <defs>
        <radialGradient id="sunGrad" cx="0.42" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#f6eccf" />
          <stop offset="0.58" stopColor="#ead27e" />
          <stop offset="1" stopColor="#d4b257" />
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
          fill="#e0c06a"
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

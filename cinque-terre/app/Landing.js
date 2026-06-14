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
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return; // guard React strict-mode double-invoke
    logged.current = true;
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "visit" }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // Scroll / swipe / button all bring the booking card in as an overlay —
  // same screen, no navigation.
  const [showBook, setShowBook] = useState(false);
  useEffect(() => {
    const onWheel = (e) => {
      if (e.deltaY > 12) setShowBook(true);
    };
    let ty = 0;
    const onTouchStart = (e) => {
      ty = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e) => {
      if (ty - (e.changedTouches[0]?.clientY ?? ty) > 44) setShowBook(true);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowBook(false);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

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

      <div className="grain" aria-hidden="true"></div>
      <div className="cursor" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>

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
          <div className="sea-copy">
            <p className="tagline">The world&apos;s most beautiful sea tour.</p>
            <p className="lede">
              Three slow hours on the Ligurian blue — hidden coves, swim stops,
              a sunset aperitivo, and your own skipper aboard the Paolona.
            </p>
          </div>
          <div className="cta-wrap">
            <button className="cta" onClick={() => setShowBook(true)}>
              Reserve your seat
            </button>
          </div>
          <div className="scroll-hint">
            <span>scroll</span>
            <span className="dot"></span>
          </div>
        </header>
      </div>

      <div
        className={"book-overlay" + (showBook ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowBook(false);
        }}
      >
        <button
          className="book-close"
          onClick={() => setShowBook(false)}
          aria-label="Lukk"
        >
          ✕
        </button>
        <div className="book-overlay__inner">
          <p className="section-label">Reserve</p>
          <h2 className="section-title">Book your day</h2>
          <BookingForm />
        </div>
      </div>
    </>
  );
}

function BookingForm() {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");
  const [days, setDays] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDays(buildDays(21));
    setDate((d) => d || todayISO()); // default to today, set on the client
  }, []);

  function startConfirm() {
    setError("");
    if (!date) {
      setError("Please pick a date for your tour.");
      return;
    }
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    setDone(true);
  }

  const sel = days.find((d) => d.iso === date);

  if (done) {
    const code = makeCode(date, guests);
    const tel = tour.phone.replace(/\s/g, "");
    const digits = tour.phone.replace(/[^\d]/g, "");
    const when = sel ? `${sel.label} · ${sel.small}` : date;
    const msg = `Hei! Jeg vil reservere Monterosso sea tour. Kode: ${code} (${when}, ${guests} ${guests === 1 ? "gjest" : "gjester"}).`;
    const enc = encodeURIComponent(msg);
    const log = (type) => {
      try {
        navigator.sendBeacon?.(
          "/api/track",
          new Blob([JSON.stringify({ type, code, dato: date, guests })], {
            type: "application/json",
          })
        );
      } catch {}
    };
    return (
      <div className="book-form">
        <p className="meta">Reservasjonskode</p>
        <div className="rescode">{code}</div>
        <p className="rescode__sub">
          {when} · {guests} {guests === 1 ? "gjest" : "gjester"}
        </p>
        <a
          className="pay"
          href={`https://wa.me/${digits}?text=${enc}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => log("whatsapp")}
        >
          WhatsApp
        </a>
        <div className="chanrow">
          <a
            className="chanbtn"
            href={`sms:${tel}?&body=${enc}`}
            onClick={() => log("sms")}
          >
            SMS
          </a>
          <a className="chanbtn" href={`tel:${tel}`} onClick={() => log("call")}>
            Ring
          </a>
        </div>
        <p className="reassure">
          Send koden, så er plassen din · {tour.phone}
        </p>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setDone(false);
            setConfirming(false);
          }}
        >
          Ny reservasjon
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="book-form">
        <p className="meta">Bekreft reservasjonen</p>
        <div className="confirm">
          <div className="confirm__row">
            <span>Dato</span>
            <b>{sel ? `${sel.label} · ${sel.small}` : date}</b>
          </div>
          <div className="confirm__row">
            <span>Gjester</span>
            <b>{guests}</b>
          </div>
          <div className="confirm__row">
            <span>Tur</span>
            <b>Monterosso sea tour</b>
          </div>
        </div>
        <div className="total-row">
          <span className="t-label">Total</span>
          <span className="t-val">€{tour.priceEur * guests}</span>
        </div>
        <button className="pay" onClick={handleConfirm}>
          Verifiser
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => setConfirming(false)}
        >
          Endre
        </button>
        <p className="err">{error}</p>
        <p className="reassure">
          Ingen forhåndsbetaling — du får en kode å oppgi på telefon.
        </p>
      </div>
    );
  }

  return (
    <div className="book-form">
      <p className="meta">
        Monterosso sea tour · {tour.durationHours} hours · max {tour.maxGuests}{" "}
        guests
      </p>
      <div className="row">
        <div className="field">
          <span className="field-head">Date</span>
          <DateQuick value={date} onChange={setDate} days={days} />
          <WheelPicker
            ariaLabel="Velg dag"
            value={date}
            onChange={setDate}
            items={days.map((d) => ({ value: d.iso, label: d.label, sub: d.small }))}
          />
        </div>
        <div className="field">
          <span className="field-head">Guests</span>
          <GuestQuick value={guests} onChange={setGuests} max={tour.maxGuests} />
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
      <button className="pay" onClick={startConfirm}>
        Reserver
      </button>
      <p className="err">{error}</p>
      <p className="reassure">
        Ingen forhåndsbetaling · €{tour.priceEur} / head
      </p>
    </div>
  );
}

function todayISO() {
  return new Date().toLocaleDateString("sv-SE");
}
/* Reservation code the owner can read back: MT-DDMMYY-<guests>. */
function makeCode(iso, guests) {
  const [y, m, d] = iso.split("-");
  return `MT-${d}${m}${y.slice(2)}-${guests}`;
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

/* Desktop date: today (prominent) + tomorrow + day-after, the later ones
   progressively hazier — a gentle nudge to book today. */
function DateQuick({ value, onChange, days }) {
  const [open, setOpen] = useState(false);
  const sel = days.find((d) => d.iso === value) || days[0];

  if (open) {
    return (
      <div className="dq dq--picker">
        <div className="dq-pick__head">
          <span>Velg dato</span>
          <button
            type="button"
            className="dq-pick__close"
            onClick={() => setOpen(false)}
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>
        <div className="dq-pick__list">
          {days.map((d) => (
            <button
              type="button"
              key={d.iso}
              className={`dq-pick__opt${d.iso === value ? " is-sel" : ""}`}
              onClick={() => {
                onChange(d.iso);
                setOpen(false);
              }}
            >
              <span>{d.label}</span>
              <span className="dq__date">{d.small}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dq">
      <div className="dq__opt dq--t1 is-sel dq--default">
        <span className="dq__label">{sel ? sel.label : "I dag"}</span>
        {sel && <span className="dq__date">{sel.small}</span>}
      </div>
      <button
        type="button"
        className="dq__opt dq--more"
        onClick={() => setOpen(true)}
      >
        <span className="dq__label">Velg dato</span>
      </button>
    </div>
  );
}

/* Desktop guests: same tiered tiles (2 / 4 / 6, max-6 to start) plus a fourth
   "Velg antall" tile that opens a compact 1–8 grid in the same box. */
function GuestQuick({ value, onChange, max }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="dq dq--picker">
        <div className="dq-pick__head">
          <span>Velg antall</span>
          <button
            type="button"
            className="dq-pick__close"
            onClick={() => setOpen(false)}
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>
        <div className="gq-grid">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              className={`gq-chip${value === n ? " is-sel" : ""}`}
              onClick={() => {
                onChange(n);
                setOpen(false);
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dq">
      <div className="dq__opt dq--t1 is-sel dq--default">
        <span className="dq__label">{value} guests</span>
      </div>
      <button
        type="button"
        className="dq__opt dq--more"
        onClick={() => setOpen(true)}
      >
        <span className="dq__label">Velg antall</span>
      </button>
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

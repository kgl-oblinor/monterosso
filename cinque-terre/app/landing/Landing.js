"use client";

import { useEffect, useRef, useState } from "react";
import { tour } from "../../lib/tour";
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
    <div className="landing-v2">
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
          A private sea tour of the Cinque Terre from Monterosso al Mare,
          Liguria — three unhurried hours along the coast, ${tour.priceUsd} per
          guest. Reserve in a moment, no prepayment.
        </p>

        {/* SCREEN 1 — HERO + RESERVE CTA */}
        <header className="hero" id="top">
          <p className="eyebrow">Monterosso al Mare</p>
          <h1>Cinque Terre</h1>
          <div className="sea-copy">
            <p className="tagline">
              Gita in barca sul Mar Ligure,
              <br />a bordo della Paolona.
            </p>
          </div>
          <div className="cta-wrap">
            <button className="cta" onClick={() => setShowBook(true)}>
              Reserve your place
            </button>
          </div>
          <div className="scroll-hint">
            <span>andiamo</span>
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
        <div className="book-overlay__inner">
          {/* anchored to the card's top-right corner (absolute, not fixed)
              so it sits just above the card and is identical across browsers */}
          <button
            className="book-close"
            onClick={() => setShowBook(false)}
            aria-label="Lukk"
          >
            ✕
          </button>
          <p className="section-label">Prenota</p>
          <h2 className="section-title">A private day on the Ligurian blue</h2>
          <BookingForm active={showBook} />
        </div>
      </div>
    </div>
  );
}

function BookingForm({ active }) {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");
  const [days, setDays] = useState([]);
  const [step, setStep] = useState("date"); // "date" → "guests" → review
  const [done, setDone] = useState(false);
  const [sent, setSent] = useState(false);
  const [method, setMethod] = useState("call");
  const [channel, setChannel] = useState("whatsapp");

  useEffect(() => {
    setDays(buildDays(21));
    setDate((d) => d || todayISO()); // default to today, set on the client
  }, []);

  function nextFromDate() {
    setError("");
    if (!date) {
      setError("Please pick a date for your tour.");
      return;
    }
    setStep("guests");
  }
  function review() {
    setError("");
    if (!date) {
      setError("Please pick a date for your tour.");
      return;
    }
    setDone(true);
  }

  // ← / → step through date → guests → confirm while the popup is open
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (done || sent) return;
        if (step === "date") nextFromDate();
        else review();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (done) setDone(false);
        else if (step === "guests") setStep("date");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, done, sent, step, date]);

  const sel = days.find((d) => d.iso === date);
  const code = makeCode(date, guests);
  const when = sel ? `${sel.label} · ${sel.small}` : date;
  const total = totalFor(guests);

  // SCREEN 3 — confirmation: combined info + add-to-calendar + share
  if (sent) {
    return (
      <div className="book-form confirm-sent">
        <p className="meta">You&apos;re all set</p>
        <p className="confirm-lead">
          Request sent — we&apos;ll confirm your place by{" "}
          {method === "call"
            ? "phone"
            : channel === "imessage"
            ? "iMessage"
            : "WhatsApp"}
          .
        </p>
        <div className="conf-summary">
          <div className="conf-row">
            <span>When</span>
            <strong>{when}</strong>
          </div>
          <div className="conf-row">
            <span>Guests</span>
            <strong>
              {guests} {guests === 1 ? "guest" : "guests"}
            </strong>
          </div>
          <div className="conf-row">
            <span>Total</span>
            <strong>${total}</strong>
          </div>
          <div className="conf-row">
            <span>Code</span>
            <strong>{code}</strong>
          </div>
        </div>
        <p className="cal-label">Add to calendar</p>
        <div className="cal-row">
          <a
            className="cal-btn"
            href={googleCalUrl({ iso: date, guests, total, code })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalGlyph />
            Google
          </a>
          <button
            type="button"
            className="cal-btn"
            onClick={() => downloadIcs({ iso: date, guests, total, code })}
          >
            <CalGlyph />
            Apple
          </button>
        </div>
        <button
          type="button"
          className="pay pay--ghost share-btn"
          onClick={() => shareTrip({ when, guests })}
        >
          Share with friends
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setSent(false);
            setDone(false);
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (done) {
    const tel = tour.phone.replace(/\s/g, "");
    const digits = tour.phone.replace(/[^\d]/g, "");
    const msg = `Hi! I'd like to book the Monterosso sea tour. Code: ${code} — ${when}, ${guests} ${guests === 1 ? "guest" : "guests"}, $${total}.`;
    const enc = encodeURIComponent(msg);
    const href =
      method === "call"
        ? `tel:${tel}`
        : channel === "imessage"
        ? `sms:${tel}&body=${enc}`
        : `https://wa.me/${digits}?text=${enc}`;
    const logType = method === "call" ? "call" : channel;
    const newTab = method === "text" && channel === "whatsapp";
    const log = () => {
      try {
        navigator.sendBeacon?.(
          "/api/track",
          new Blob([JSON.stringify({ type: logType, code, dato: date, guests })], {
            type: "application/json",
          })
        );
      } catch {}
    };
    const mTile = (val) =>
      `dq__opt dq--t1${method === val ? " is-sel dq--default" : ""}`;
    const cTile = (val) =>
      `dq__opt dq--t1${channel === val ? " is-sel dq--default" : ""}`;
    return (
      <div className="book-form">
        <p className="meta">Confirm &amp; send</p>
        <span className="field-head">How to send</span>
        <div className="chan-tiles">
          <button
            type="button"
            className={mTile("call")}
            onClick={() => setMethod("call")}
          >
            <span className="dq__label">Call</span>
          </button>
          <button
            type="button"
            className={mTile("text")}
            onClick={() => setMethod("text")}
          >
            <span className="dq__label">Text</span>
          </button>
        </div>
        <div className="chan-tiles chan-tiles--sub">
          <button
            type="button"
            className={cTile("whatsapp")}
            onClick={() => setChannel("whatsapp")}
          >
            <span className="dq__label">WhatsApp</span>
          </button>
          <button
            type="button"
            className={cTile("imessage")}
            onClick={() => setChannel("imessage")}
          >
            <span className="dq__label">iMessage</span>
          </button>
        </div>
        <p className="send-summary">
          {when} · {guests} {guests === 1 ? "guest" : "guests"} · ${total}
        </p>
        <a
          className="pay"
          href={href}
          target={newTab ? "_blank" : undefined}
          rel="noopener noreferrer"
          onClick={() => {
            log();
            setSent(true);
          }}
        >
          Send request
        </a>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setError("");
            setDone(false);
            setStep("date");
          }}
        >
          Change
        </button>
      </div>
    );
  }

  // STEP 2 — guests (single popup), after the date
  if (step === "guests") {
    return (
      <div className="book-form">
        <p className="meta">
          <span className="meta-seg">{when}</span>
        </p>
        <div className="field">
          <span className="field-head">How many guests?</span>
          <GuestQuick value={guests} onChange={setGuests} max={tour.maxGuests} />
          <WheelPicker
            ariaLabel="Number of guests"
            value={guests}
            onChange={setGuests}
            items={Array.from({ length: tour.maxGuests }, (_, i) => ({
              value: i + 1,
              label: String(i + 1),
            }))}
          />
        </div>
        <div className="total-row">
          <span className="price-note">
            {discountFor(guests) > 0
              ? `$${totalFor(guests)} total · ${Math.round(
                  discountFor(guests) * 100
                )}% off`
              : `$${totalFor(guests)} total`}
          </span>
          <span className="t-val">
            ${perPersonFor(guests)} <span className="t-per">/ person</span>
          </span>
        </div>
        <button className="pay" onClick={review}>
          Next
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setError("");
            setStep("date");
          }}
        >
          Back
        </button>
        <p className="reassure">No prepayment · ${tour.priceUsd} per guest</p>
      </div>
    );
  }

  // STEP 1 — date (single popup)
  return (
    <div className="book-form">
      <p className="meta">
        <span className="meta-seg">A private sea tour from Monterosso</span>{" "}
        <span className="meta-seg">
          <span className="meta-dot">·</span> {tour.durationHours} hours
        </span>{" "}
        <span className="meta-seg">
          <span className="meta-dot">·</span> up to {tour.maxGuests} guests
        </span>
      </p>
      <div className="field">
        <span className="field-head">Which day?</span>
        <DateQuick value={date} onChange={setDate} days={days} />
        <WheelPicker
          ariaLabel="Pick a day"
          value={date}
          onChange={setDate}
          items={days.map((d) => ({ value: d.iso, label: d.label, sub: d.small }))}
        />
      </div>
      <button className="pay" onClick={nextFromDate}>
        Next
      </button>
      <p className="err">{error}</p>
      <p className="reassure">No prepayment · ${tour.priceUsd} per guest</p>
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
/* Group discount: 2+ guests 10% off, 4+ guests 12% off; 1 = full premium price. */
function discountFor(g) {
  if (g >= 4) return 0.12;
  if (g >= 2) return 0.1;
  return 0;
}
function totalFor(g) {
  return Math.round(g * tour.priceUsd * (1 - discountFor(g)));
}
function perPersonFor(g) {
  return Math.round(tour.priceUsd * (1 - discountFor(g)));
}

/* ---------- Add-to-calendar / share helpers ----------
   The tour runs 3 hours; start time isn't fixed yet, so we use a provisional
   10:00–13:00 in Monterosso's timezone (Europe/Rome) and say so. */
const CAL_LOCATION = "Monterosso al Mare, Cinque Terre, Italy";
const CAL_TZ = "Europe/Rome";

function calRange(iso) {
  const ymd = iso.replaceAll("-", "");
  return { start: `${ymd}T100000`, end: `${ymd}T130000` };
}
function calDetails(code, guests, total) {
  const g = `${guests} ${guests === 1 ? "guest" : "guests"}`;
  return `Reservation ${code} · ${g} · $${total}. Pending confirmation — we'll be in touch. Start time is provisional (10:00, local) and will be confirmed.`;
}

function googleCalUrl({ iso, guests, total, code }) {
  const { start, end } = calRange(iso);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: tour.name,
    dates: `${start}/${end}`,
    ctz: CAL_TZ,
    details: calDetails(code, guests, total),
    location: CAL_LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcs({ iso, guests, total, code }) {
  const { start, end } = calRange(iso);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const esc = (s) =>
    String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Monterosso//Cinque Terre//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${code}@monterosso-cinque-terre`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${CAL_TZ}:${start}`,
    `DTEND;TZID=${CAL_TZ}:${end}`,
    `SUMMARY:${esc(tour.name)}`,
    `DESCRIPTION:${esc(calDetails(code, guests, total))}`,
    `LOCATION:${esc(CAL_LOCATION)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs(opts) {
  const blob = new Blob([buildIcs(opts)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "monterosso-cinque-terre.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function shareTrip({ when, guests }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const g = `${guests} ${guests === 1 ? "guest" : "guests"}`;
  const text = `Join me on the Monterosso · Cinque Terre sea tour — ${when}, ${g}.`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Cinque Terre sea tour", text, url });
      return;
    }
  } catch {
    return; // user dismissed the share sheet
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    alert("Link copied — share it with your friends!");
  } catch {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank"
    );
  }
}

function CalGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="4.5"
        width="18"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 9h18M8 2.5v4M16 2.5v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Friendly day picker: today / tomorrow / day-after-tomorrow, then weekdays,
   with the actual date kept small and subtle in the poster's gold. */
function buildDays(n) {
  const rel = ["Today", "Tomorrow", "Day after"];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      iso: d.toLocaleDateString("sv-SE"),
      label: i < 3 ? rel[i] : cap(d.toLocaleDateString("en-GB", { weekday: "long" })),
      small: d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
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
          <span>Pick a date</span>
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
      <button
        type="button"
        className="dq__opt dq--t1 is-sel dq--default dq--trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Change date"
      >
        <span className="dq__label">{sel ? sel.label : "Today"}</span>
        {sel && <span className="dq__date">{sel.small}</span>}
        <span className="dq__caret" aria-hidden="true">⌄</span>
      </button>
    </div>
  );
}

/* Desktop guests: same tiered tiles (2 / 4 / 6, max-6 to start) plus a fourth
   "Pick a number" tile that opens a compact 1–8 grid in the same box. */
function GuestQuick({ value, onChange, max }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="dq dq--picker">
        <div className="dq-pick__head">
          <span>Pick a number</span>
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
      <button
        type="button"
        className="dq__opt dq--t1 is-sel dq--default dq--trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Change number of guests"
      >
        <span className="dq__label">{value} guests</span>
        <span className="dq__caret" aria-hidden="true">⌄</span>
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

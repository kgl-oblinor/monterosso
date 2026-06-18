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
  const [about, setAbout] = useState(false); // "about us" — the sixth window
  const aboutSeen = useRef(false);
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
      if (e.key !== "Escape") return;
      if (!aboutSeen.current) {
        aboutSeen.current = true;
        setAbout(true);
      } else {
        setShowBook(false);
        setAbout(false);
      }
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

  // Exit-intent: the first attempt to close the booking opens "about us"
  // (the sixth window); a second attempt actually closes.
  function tryClose() {
    if (!aboutSeen.current) {
      aboutSeen.current = true;
      setAbout(true);
      return;
    }
    setShowBook(false);
    setAbout(false);
  }
  function closeAll() {
    setShowBook(false);
    setAbout(false);
  }

  return (
    <div className="landing-v2">
      <Effects />

      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle light or dark mode"
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
              A private sail on the Mar Ligure,
              <br />aboard the Paolona.
            </p>
          </div>
          <div className="cta-wrap">
            <button className="cta" onClick={() => setShowBook(true)}>
              Reserve your place
            </button>
          </div>
          <div className="scroll-hint">
            <span>Andiamo</span>
            <span className="dot"></span>
          </div>
        </header>
      </div>

      <div
        className={"book-overlay" + (showBook ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) tryClose();
        }}
      >
        <div className="book-overlay__inner">
          {about ? (
            <>
              <button
                className="book-close"
                onClick={closeAll}
                aria-label="Close"
              >
                ✕
              </button>
              <p className="section-label">About us</p>
              <h2 className="section-title">The crew of the Paolona</h2>
              <div className="crew">
                <div className="crew-card">
                  <div className="crew-photo" aria-hidden="true">
                    ♀
                  </div>
                  <p className="crew-name">She · 38</p>
                  <p className="crew-seeks">
                    Seeking a gentleman, 72+ — and generously rich.
                  </p>
                </div>
                <div className="crew-card">
                  <div className="crew-photo" aria-hidden="true">
                    ♂
                  </div>
                  <p className="crew-name">He · 42</p>
                  <p className="crew-seeks">
                    Seeking ladies, 65+, for champagne at sunset.
                  </p>
                </div>
              </div>
              <p className="about-note">
                Names, portraits and proper introductions to follow.
              </p>
              <button type="button" className="pay" onClick={closeAll}>
                Close
              </button>
              <button
                type="button"
                className="confirm__back"
                onClick={() => setAbout(false)}
              >
                ← Back to booking
              </button>
            </>
          ) : (
            <>
              {/* anchored to the card's top-right corner (absolute, not fixed)
                  so it sits just above the card, identical across browsers */}
              <button
                className="book-close"
                onClick={tryClose}
                aria-label="Close"
              >
                ✕
              </button>
              <p className="section-label">Reserve</p>
              <h2 className="section-title">
                A private day on the Ligurian blue
              </h2>
              <BookingForm active={showBook} />
            </>
          )}
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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [slot, setSlot] = useState("sunset");
  const [boarding, setBoarding] = useState("no");
  const [wantWa, setWantWa] = useState(true);
  const [wantMail, setWantMail] = useState(true);
  const [dateMore, setDateMore] = useState(false);

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
        else if (step === "guests") setStep("time");
        else if (step === "time") setStep("aboard");
        else review();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (done) setDone(false);
        else if (step === "aboard") setStep("time");
        else if (step === "time") setStep("guests");
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
  const total = totalFor(guests, slot);
  const slotLabel = tour.slots[slot]?.label || "Sunset";

  // SCREEN 3 — confirmation: combined info + add-to-calendar + share
  if (sent) {
    return (
      <div className="book-form confirm-sent">
        <p className="meta">All arranged</p>
        <p className="confirm-lead">
          Thank you — we shall be in touch at{" "}
          <strong>{phone || email || "your contact"}</strong> to confirm your
          place.
        </p>
        <div className="conf-summary">
          <div className="conf-row">
            <span>When</span>
            <strong>{when}</strong>
          </div>
          <div className="conf-row">
            <span>Departure</span>
            <strong>{slotLabel}</strong>
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
          {boarding === "yes" && (
            <div className="conf-row">
              <span>Aboard</span>
              <strong>A hand, please</strong>
            </div>
          )}
        </div>
        <p className="cal-label">Add to calendar</p>
        <div className="cal-row">
          <a
            className="cal-btn"
            href={googleCalUrl({ iso: date, guests, total, code, slot })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalGlyph />
            Google
          </a>
          <button
            type="button"
            className="cal-btn"
            onClick={() => downloadIcs({ iso: date, guests, total, code, slot })}
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
    const bizDigits = tour.phone.replace(/[^\d]/g, ""); // business WhatsApp
    const submit = () => {
      setError("");
      const ph = phone.trim();
      const em = email.trim();
      if (!ph && !em) {
        setError("Add a phone/WhatsApp number or email so we can reach you.");
        return;
      }
      // 1) save the lead to our backend (D1)
      try {
        navigator.sendBeacon?.(
          "/api/track",
          new Blob(
            [
              JSON.stringify({
                type: "lead",
                code,
                dato: date,
                guests,
                phone: ph,
                email: em,
                slot,
                boarding,
              }),
            ],
            { type: "application/json" }
          )
        );
      } catch {}
      // 2) fire the enabled channels — WhatsApp first, then email
      const details = `Monterosso sea tour\nCode: ${code}\n${when} · ${slotLabel} · ${guests} ${
        guests === 1 ? "guest" : "guests"
      } · $${total}${
        boarding === "yes" ? "\nNeeds a hand coming aboard" : ""
      }\nContact: ${ph || "—"}${em ? " · " + em : ""}`;
      if (wantWa) {
        try {
          // wa.me is the universal link — opens the app on iOS/Android and
          // WhatsApp Web on desktop, so it works on every device
          window.open(
            `https://wa.me/${bizDigits}?text=${encodeURIComponent(
              "New booking enquiry — " + details
            )}`,
            "_blank",
            "noopener"
          );
        } catch {}
      }
      if (wantMail) {
        const mailto = `mailto:${tour.email}?subject=${encodeURIComponent(
          `Booking enquiry — Monterosso sea tour (${code})`
        )}&body=${encodeURIComponent(details)}`;
        try {
          // let WhatsApp open first, then hand off to the mail client
          if (wantWa) setTimeout(() => (window.location.href = mailto), 600);
          else window.location.href = mailto;
        } catch {}
      }
      setSent(true);
    };
    return (
      <div className="book-form">
        <p className="meta">Confirm &amp; send</p>
        <p className="confirm-lead">
          Leave your details and we shall confirm your place.
        </p>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="field contact-field">
            <span className="field-head">Phone / WhatsApp</span>
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+39 …"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="field contact-field">
            <span className="field-head">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <span className="field-head send-via">Send via</span>
          <div className="send-toggles">
            <button
              type="button"
              role="switch"
              aria-checked={wantWa}
              className={"toggle-row" + (wantWa ? " is-on" : "")}
              onClick={() => setWantWa((v) => !v)}
            >
              <span className="toggle-label">WhatsApp</span>
              <span className="switch" aria-hidden="true"></span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={wantMail}
              className={"toggle-row" + (wantMail ? " is-on" : "")}
              onClick={() => setWantMail((v) => !v)}
            >
              <span className="toggle-label">Email</span>
              <span className="switch" aria-hidden="true"></span>
            </button>
          </div>
          <p className="send-summary">
            {when} · {slotLabel} · {guests}{" "}
            {guests === 1 ? "guest" : "guests"} · ${total}
          </p>
          <button type="submit" className="pay">
            Send enquiry
          </button>
        </form>
        <p className="err">{error}</p>
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
        <span className="field-head step-q">How many in your party?</span>
        <div className="choice-grid choice-grid--nums">
          {Array.from({ length: tour.maxGuests }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              className={"choice choice--num" + (guests === n ? " is-sel" : "")}
              onClick={() => setGuests(n)}
            >
              <span className="choice-label">{n}</span>
            </button>
          ))}
        </div>
        <button className="pay" onClick={() => setStep("time")}>
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
        <p className="reassure">No prepayment · from ${tour.priceUsd} per guest</p>
      </div>
    );
  }

  // STEP 3 — departure time (single popup, big tap tiles)
  if (step === "time") {
    const opts = ["sunrise", "sunset"].map((v) => ({
      v,
      label: tour.slots[v].label,
      sub: `${tour.slots[v].window} · $${slotPriceUsd(v)}/guest`,
    }));
    return (
      <div className="book-form">
        <p className="meta">
          <span className="meta-seg">{when}</span>
        </p>
        <span className="field-head step-q">
          When would you care to set off?
        </span>
        <div className="choice-grid choice-grid--2">
          {opts.map((o) => (
            <button
              type="button"
              key={o.v}
              className={"choice" + (slot === o.v ? " is-sel" : "")}
              onClick={() => setSlot(o.v)}
            >
              <span className="choice-label">{o.label}</span>
              <span className="choice-sub">{o.sub}</span>
            </button>
          ))}
        </div>
        <button className="pay" onClick={() => setStep("aboard")}>
          Next
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => setStep("guests")}
        >
          Back
        </button>
      </div>
    );
  }

  // STEP 4 — a hand getting aboard? (single popup, big tap tiles)
  if (step === "aboard") {
    return (
      <div className="book-form">
        <p className="meta">
          <span className="meta-seg">
            {when} · {slotLabel}
          </span>
        </p>
        <span className="field-head step-q">
          Will anyone require a hand coming aboard?
        </span>
        <div className="choice-grid choice-grid--2">
          <button
            type="button"
            className={"choice" + (boarding === "yes" ? " is-sel" : "")}
            onClick={() => setBoarding("yes")}
          >
            <span className="choice-label">Yes, please</span>
            <span className="choice-sub">we shall be ready to help</span>
          </button>
          <button
            type="button"
            className={"choice" + (boarding === "no" ? " is-sel" : "")}
            onClick={() => setBoarding("no")}
          >
            <span className="choice-label">No, thank you</span>
          </button>
        </div>
        <button className="pay" onClick={review}>
          Next
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => setStep("time")}
        >
          Back
        </button>
      </div>
    );
  }

  // STEP 1 — date (single popup)
  return (
    <div className="book-form">
      <p className="meta">
        <span className="meta-seg">A private sea tour from Monterosso</span>{" "}
        <span className="meta-seg">
          <span className="meta-dot">·</span> up to {tour.maxGuests} guests
        </span>
      </p>
      <span className="field-head step-q">Which day?</span>
      {dateMore ? (
        <div className="choice-grid choice-scroll">
          {days.map((d) => (
            <button
              type="button"
              key={d.iso}
              className={"choice" + (date === d.iso ? " is-sel" : "")}
              onClick={() => setDate(d.iso)}
            >
              <span className="choice-label">{d.label}</span>
              <span className="choice-sub">{d.small}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="choice-grid">
          {days.slice(0, 3).map((d) => (
            <button
              type="button"
              key={d.iso}
              className={"choice" + (date === d.iso ? " is-sel" : "")}
              onClick={() => setDate(d.iso)}
            >
              <span className="choice-label">{d.label}</span>
              <span className="choice-sub">{d.small}</span>
            </button>
          ))}
          <button
            type="button"
            className="choice choice--more"
            onClick={() => setDateMore(true)}
          >
            <span className="choice-label">Another day…</span>
          </button>
        </div>
      )}
      <button className="pay" onClick={nextFromDate}>
        Next
      </button>
      <p className="err">{error}</p>
      <p className="reassure">No prepayment · from ${tour.priceUsd} per guest</p>
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
function slotPriceUsd(slot) {
  const m = tour.slots[slot]?.priceMultiplier ?? 1;
  return Math.round(tour.priceUsd * m);
}
function totalFor(g, slot) {
  return Math.round(g * slotPriceUsd(slot) * (1 - discountFor(g)));
}

/* ---------- Add-to-calendar / share helpers ----------
   Event uses the chosen slot's window in Monterosso's timezone (Europe/Rome). */
const CAL_LOCATION = "Monterosso al Mare, Cinque Terre, Italy";
const CAL_TZ = "Europe/Rome";

function calRange(iso, slot) {
  const ymd = iso.replaceAll("-", "");
  const s = tour.slots[slot] || tour.slots.sunset;
  return { start: `${ymd}T${s.start}`, end: `${ymd}T${s.end}` };
}
function calDetails(code, guests, total, slot) {
  const g = `${guests} ${guests === 1 ? "guest" : "guests"}`;
  const s = tour.slots[slot]?.label;
  return `Reservation ${code}${s ? " · " + s : ""} · ${g} · $${total}. Pending confirmation — we'll be in touch.`;
}

function googleCalUrl({ iso, guests, total, code, slot }) {
  const { start, end } = calRange(iso, slot);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: tour.name,
    dates: `${start}/${end}`,
    ctz: CAL_TZ,
    details: calDetails(code, guests, total, slot),
    location: CAL_LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcs({ iso, guests, total, code, slot }) {
  const { start, end } = calRange(iso, slot);
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
    `DESCRIPTION:${esc(calDetails(code, guests, total, slot))}`,
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

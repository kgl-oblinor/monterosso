"use client";

import { useEffect, useRef, useState } from "react";
import { tour, WHATSAPP_NUMBER, MEETING_POINT, SKIPPER_NAME } from "../../lib/tour";

// 🤍 Built with love on this coast — for vakreste Mandy, always remembered here.
import Skyline from "./Skyline";
import Boat3D from "./Boat3D";
import Clouds from "./Clouds";
import Constellations from "./Constellations";
import ClockTower from "./ClockTower";
import Signpost from "./Signpost";
import VillagePage from "./VillagePage";
import { VILLAGES } from "./villageData";

const firstName = (n) => n.split(" ")[0]; // "Monterosso al Mare" → "Monterosso"

// Ready-made WhatsApp openers the customer can pick instead of booking outright.
const WA_ALTS = [
  "Hi! Which times do you have available this week?",
  "Hi! We are four — what is the price for a private tour?",
];

// Selectable backgrounds. "scene" = the live animated scene (day/night).
// The rest are still photos; when one is active the whole live scene is
// hidden — only the hero text + CTA sit over the image.
const BGS = [
  { key: "scene", label: "Living scene" },
  { key: "bay", label: "Aerial bay", src: "/backgrounds/aerial-bay.webp" },
  { key: "deepblue", label: "Deep blue", src: "/backgrounds/aerial-deepblue.webp" },
  { key: "villages", label: "Villages", src: "/backgrounds/village-panorama.webp" },
];

// slim arrow that breathes with the loop script (stroke = currentColor)
function Arrow() {
  return (
    <svg
      className="arr"
      viewBox="0 0 44 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="1" y1="6" x2="37" y2="6" />
      <path d="M30 1.8 41 6 30 10.2" />
    </svg>
  );
}

// hub icons — drawn as strokes; colour/size come from CSS (.hub-tile__ic svg)
const ICON = {
  news: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h12v14H6a2 2 0 0 1-2-2V5z" />
      <path d="M16 8h4v9a2 2 0 0 1-2 2" />
      <line x1="7" y1="9" x2="13" y2="9" />
      <line x1="7" y1="12.5" x2="13" y2="12.5" />
      <line x1="7" y1="16" x2="11" y2="16" />
    </svg>
  ),
  boat: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2v12" />
      <path d="M12 3C8 5 6 9.5 6 14h6z" />
      <path d="M4.5 16h15l-2.2 3.6a2 2 0 0 1-1.7 1H8.4a2 2 0 0 1-1.7-1L4.5 16z" />
    </svg>
  ),
  booking: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="8.5" y1="3" x2="8.5" y2="6.5" />
      <line x1="15.5" y1="3" x2="15.5" y2="6.5" />
    </svg>
  ),
  captain: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.4" />
      <line x1="12" y1="3.5" x2="12" y2="8.6" />
      <line x1="12" y1="15.4" x2="12" y2="20.5" />
      <line x1="3.5" y1="12" x2="8.6" y2="12" />
      <line x1="15.4" y1="12" x2="20.5" y2="12" />
    </svg>
  ),
};

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
  const [bg, setBg] = useState("scene"); // "scene" | photo key
  const bgSrc = BGS.find((b) => b.key === bg)?.src;
  const [villageIdx, setVillageIdx] = useState(null); // open village page (0–4) or null
  const [showBoat, setShowBoat] = useState(false); // "the boat & her captain" page
  const [showHub, setShowHub] = useState(false); // "Explore" — the hub of everything
  const [showCaptain, setShowCaptain] = useState(false); // the captain's own page
  const [showNews, setShowNews] = useState(false); // news / from the coast
  const [showService, setShowService] = useState(false); // customer service / help
  // any popup open → hide everything "alive" (boat, hero, animations); only the
  // still backdrop (sky or photo) stays behind the glass popup
  const anyOpen =
    showBook ||
    villageIdx !== null ||
    showBoat ||
    showHub ||
    showCaptain ||
    showNews ||
    showService;
  // open the hub from any card's "Read more"
  const openHub = () => {
    setShowBook(false);
    setShowBoat(false);
    setVillageIdx(null);
    setShowCaptain(false);
    setShowNews(false);
    setShowService(false);
    setShowHub(true);
  };
  const openService = () => {
    setShowBook(false);
    setShowBoat(false);
    setVillageIdx(null);
    setShowCaptain(false);
    setShowNews(false);
    setShowHub(false);
    setShowService(true);
  };
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
      if (e.key === "Escape") {
        setShowBook(false);
        setShowBoat(false);
        setVillageIdx(null);
        setShowHub(false);
        setShowCaptain(false);
        setShowNews(false);
        setShowService(false);
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

  return (
    <div
      className={
        "landing-v2" +
        (bg !== "scene" ? " bg-photo-on" : "") +
        (anyOpen ? " popup-open" : "")
      }
    >
      <Effects />

      {bg !== "scene" && bgSrc && (
        <div
          className="bg-photo"
          aria-hidden="true"
          style={{ backgroundImage: `url(${bgSrc})` }}
        />
      )}

      {/* background switcher — a top-right column: sun (day scene), moon
          (night scene), then the photo backdrops, one by one. Sun/moon also
          set the light/dark theme of the living scene. */}
      <div className="bg-switch" role="group" aria-label="Choose a background">
        <button
          type="button"
          className={
            "bg-dot bg-dot--sun" +
            (bg === "scene" && theme === "light" ? " is-sel" : "")
          }
          onClick={() => {
            setBg("scene");
            setTheme("light");
          }}
          aria-label="Daytime scene"
          title="Daytime scene"
        >
          <SunIcon />
        </button>
        <button
          type="button"
          className={
            "bg-dot bg-dot--moon" +
            (bg === "scene" && theme === "dark" ? " is-sel" : "")
          }
          onClick={() => {
            setBg("scene");
            setTheme("dark");
          }}
          aria-label="Night scene"
          title="Night scene"
        >
          <MoonIcon />
        </button>
        {BGS.filter((b) => b.src).map((b) => (
          <button
            key={b.key}
            type="button"
            className={"bg-dot" + (bg === b.key ? " is-sel" : "")}
            onClick={() => setBg(b.key)}
            aria-label={b.label}
            title={b.label}
            style={{ backgroundImage: `url(${b.src})` }}
          />
        ))}
      </div>

      <div className="grain" aria-hidden="true"></div>
      <div className="cursor" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>

      {/* sky — upper half */}
      <div className="sky" aria-hidden="true"></div>
      <div className="stars" aria-hidden="true"></div>
      <Constellations />
      <Clouds />

      {/* living sea — lower half */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora__layer aurora__layer--a"></div>
        <div className="aurora__layer aurora__layer--b"></div>
        <div className="aurora__gloss"></div>
        <div className="aurora__vignette"></div>
        <div className="sun-glint"></div>
      </div>
      {/* the five villages on the horizon */}
      <Skyline />

      {/* Vernazza's clock tower — a live clock; click opens Vernazza's page */}
      <ClockTower onOpen={() => setVillageIdx(1)} />

      {/* trail signpost — the five villages; each board opens its page */}
      <Signpost onSelect={(i) => setVillageIdx(i)} />

      {/* a little 3D tour boat sailing on the sea */}
      <Boat3D theme={theme} />

      <div className="shell">
        <p className="sr-only">
          A private sea tour of the Cinque Terre from Monterosso al Mare,
          Liguria — three unhurried hours along the coast, ${tour.priceUsd} per
          guest. Book in a moment, no prepayment.
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
            <div className="cta-wrap">
            <button className="cta" onClick={() => setShowBook(true)}>
              Come aboard
            </button>
            </div>
          </div>
          <div className="scroll-hint">
            <span>Andiamo</span>
            <span className="andiamo-fall" aria-hidden="true">
              <span className="af-bit af-bit--gold" style={{ animationDelay: "0s" }}>♥</span>
              <span className="af-bit af-bit--gold" style={{ animationDelay: "14.5s" }}>❥</span>
            </span>
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
          <button
            className="book-close"
            onClick={() => setShowBook(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <BookingForm active={showBook} />
        </div>
      </div>

      {/* VILLAGE PAGES — layer 1, the clean reading template */}
      <div
        className={"book-overlay" + (villageIdx !== null ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setVillageIdx(null);
        }}
      >
        <div className="book-overlay__inner">
          <button
            className="book-close"
            onClick={() => setVillageIdx(null)}
            aria-label="Close"
          >
            ✕
          </button>
          {villageIdx !== null && (
            <VillagePage
              village={VILLAGES[villageIdx]}
              prevName={firstName(
                VILLAGES[(villageIdx + VILLAGES.length - 1) % VILLAGES.length].name
              )}
              nextName={firstName(
                VILLAGES[(villageIdx + 1) % VILLAGES.length].name
              )}
              onPrev={() =>
                setVillageIdx(
                  (i) => (i + VILLAGES.length - 1) % VILLAGES.length
                )
              }
              onNext={() => setVillageIdx((i) => (i + 1) % VILLAGES.length)}
              onBoat={() => {
                setVillageIdx(null);
                setShowBoat(true);
              }}
              onReadMore={openHub}
              onService={openService}
            />
          )}
        </div>
      </div>

      {/* THE BOAT & HER CAPTAIN — first boat page (funnel → booking) */}
      <div
        className={"book-overlay" + (showBoat ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowBoat(false);
        }}
      >
        <div className="book-overlay__inner">
          <button
            className="book-close"
            onClick={() => setShowBoat(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <article className="village-page">
            <p className="vp-eyebrow">The boat · Cinque Terre</p>
            <h2 className="vp-title">Aboard the Paolona</h2>
            <p className="vp-lede">
              A family boat, built for this coast — yours alone for the day.
            </p>
            <p className="vp-body">
              The Paolona is a traditional Ligurian gozzo — some seven metres of
              varnished wood, blue topsides and an awning against the sun:
              stable, comfortable, and unhurried. There is no finer way to see
              the five villages than from her deck.
            </p>
            <p className="vp-body">
              She carries up to eight guests, and on every sailing she is yours
              alone — never shared with strangers. Cold drinks and an aperitivo
              wait aboard; a swim in a hidden cove waits along the way.
            </p>
            <p className="vp-body">
              And the man at her helm is half the pleasure. Meet him on the
              captain's page.
            </p>
            <p className="vp-subhead">Included</p>
            <ul className="vp-incl">
              <li>Aperitivo &amp; cold drinks aboard</li>
              <li>A swim &amp; snorkel in a hidden cove</li>
              <li>All five villages, from the water</li>
              <li>Stories from a local skipper</li>
            </ul>
            <dl className="vp-facts">
              <div className="vp-fact">
                <dt>Boat</dt>
                <dd>Ligurian gozzo · ~7 m</dd>
              </div>
              <div className="vp-fact">
                <dt>Guests</dt>
                <dd>up to {tour.maxGuests}, privately</dd>
              </div>
              <div className="vp-fact">
                <dt>Duration</dt>
                <dd>~{tour.durationHours} hours</dd>
              </div>
              <div className="vp-fact">
                <dt>Departures</dt>
                <dd>sunrise · sunshine · sunset</dd>
              </div>
              <div className="vp-fact">
                <dt>From</dt>
                <dd>${tour.priceUsd} / guest</dd>
              </div>
            </dl>
            <div className="vp-foot">
              <div className="vp-foot-row">
                <button
                  type="button"
                  className="vp-cta"
                  onClick={() => {
                    setShowBoat(false);
                    setShowBook(true);
                  }}
                >
                  Come aboard →
                </button>
                <button type="button" className="vp-read" onClick={openHub}>
                  Explore <Arrow />
                </button>
              </div>
              <div className="vp-foot-cs">
                <button type="button" className="cs-link" onClick={openService}>
                  Customer service ›
                </button>
              </div>
            </div>
            <nav className="vp-nav">
              <button
                type="button"
                onClick={() => {
                  setShowBoat(false);
                  setVillageIdx(0);
                }}
              >
                ← The five villages
              </button>
            </nav>
          </article>
        </div>
      </div>

      {/* HUB — "Explore": the icon map to everything (Leveranse 2) */}
      <div
        className={"book-overlay" + (showHub ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowHub(false);
        }}
      >
        <div className="book-overlay__inner">
          <button
            className="book-close"
            onClick={() => setShowHub(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <article className="village-page">
            <p className="vp-eyebrow">Monterosso · Cinque Terre</p>
            <h2 className="vp-title">Explore</h2>
            <p className="vp-lede">
              Everything in one place — tap to go, tap to come back.
            </p>
            <div className="hub-grid">
              <button
                type="button"
                className="hub-tile"
                onClick={() => {
                  setShowHub(false);
                  setShowNews(true);
                }}
              >
                <span className="hub-tile__ic">{ICON.news}</span>
                <span className="hub-tile__lbl">News</span>
              </button>
              <button
                type="button"
                className="hub-tile"
                onClick={() => {
                  setShowHub(false);
                  setShowBoat(true);
                }}
              >
                <span className="hub-tile__ic">{ICON.boat}</span>
                <span className="hub-tile__lbl">Boat tours</span>
              </button>
              <button
                type="button"
                className="hub-tile"
                onClick={() => {
                  setShowHub(false);
                  setShowBook(true);
                }}
              >
                <span className="hub-tile__ic">{ICON.booking}</span>
                <span className="hub-tile__lbl">Booking</span>
              </button>
              <button
                type="button"
                className="hub-tile"
                onClick={() => {
                  setShowHub(false);
                  setShowCaptain(true);
                }}
              >
                <span className="hub-tile__ic">{ICON.captain}</span>
                <span className="hub-tile__lbl">The captain</span>
              </button>
              <button
                type="button"
                className="hub-tile"
                onClick={openService}
              >
                <span className="hub-tile__ic">{ICON.help}</span>
                <span className="hub-tile__lbl">Customer service</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* THE CAPTAIN — his own page */}
      <div
        className={"book-overlay" + (showCaptain ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowCaptain(false);
        }}
      >
        <div className="book-overlay__inner">
          <button
            className="book-close"
            onClick={() => setShowCaptain(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <article className="village-page">
            <p className="vp-eyebrow">The captain · Cinque Terre</p>
            <h2 className="vp-title">{SKIPPER_NAME || "The captain"}</h2>
            <p className="vp-lede">
              Born and raised on this shore — your skipper for the day.
            </p>
            <p className="vp-body">
              An unhurried, elegant gentleman of the sea, he knows every cove
              and every hour worth sailing. He is, by his own admission, still
              seeking a rich lady over seventy; until she finds him, he is yours
              alone for the day.
            </p>
            <p className="vp-body">
              Ashore, he keeps a few simple rooms along this coast. Ask aboard,
              and he will gladly tell you which one looks out on the sea you
              sailed.
            </p>
            <div className="vp-foot">
              <div className="vp-foot-row">
                <button
                  type="button"
                  className="vp-cta"
                  onClick={() => {
                    setShowCaptain(false);
                    setShowBoat(true);
                  }}
                >
                  Aboard the Paolona →
                </button>
                <button type="button" className="vp-read" onClick={openHub}>
                  Explore <Arrow />
                </button>
              </div>
              <div className="vp-foot-cs">
                <button type="button" className="cs-link" onClick={openService}>
                  Customer service ›
                </button>
              </div>
            </div>
            <nav className="vp-nav">
              <button type="button" onClick={openHub}>
                ← Explore
              </button>
            </nav>
          </article>
        </div>
      </div>

      {/* NEWS — from the coast (built from what we have) */}
      <div
        className={"book-overlay" + (showNews ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowNews(false);
        }}
      >
        <div className="book-overlay__inner">
          <button
            className="book-close"
            onClick={() => setShowNews(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <article className="village-page">
            <p className="vp-eyebrow">From the coast · Cinque Terre</p>
            <h2 className="vp-title">News</h2>
            <p className="vp-lede">
              A few quiet words from the water.
            </p>
            <p className="vp-body">
              The Paolona sails daily from Monterosso — sunrise, sunshine and
              sunset departures, the sea calm and clear. The five villages are a
              slow, golden pleasure from the deck: lemon groves and terraced
              hills, coves for swimming, an aperitivo as the light softens.
            </p>
            <p className="vp-body">
              New to this coast? Read the five village stories, then come and
              see them from the deck — there is no finer way.
            </p>
            <div className="vp-foot">
              <div className="vp-foot-row">
                <button
                  type="button"
                  className="vp-cta"
                  onClick={() => {
                    setShowNews(false);
                    setVillageIdx(0);
                  }}
                >
                  The five villages →
                </button>
                <button type="button" className="vp-read" onClick={openHub}>
                  Explore <Arrow />
                </button>
              </div>
              <div className="vp-foot-cs">
                <button type="button" className="cs-link" onClick={openService}>
                  Customer service ›
                </button>
              </div>
            </div>
            <nav className="vp-nav">
              <button type="button" onClick={openHub}>
                ← Explore
              </button>
            </nav>
          </article>
        </div>
      </div>

      {/* CUSTOMER SERVICE — the help layer */}
      <div
        className={"book-overlay" + (showService ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowService(false);
        }}
      >
        <div className="book-overlay__inner">
          <button
            className="book-close"
            onClick={() => setShowService(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <article className="village-page">
            <p className="vp-eyebrow">Help · Cinque Terre</p>
            <h2 className="vp-title">Customer service</h2>
            <p className="vp-lede">
              We are here to help — every step of the way.
            </p>
            <div className="cs-options">
              <a
                className="cs-opt"
                href={`https://wa.me/${tour.phone.replace(
                  /[^\d]/g,
                  ""
                )}?text=${encodeURIComponent(
                  "Hello — I have a question about the Cinque Terre boat tour."
                )}`}
                target="_blank"
                rel="noopener"
              >
                <span>
                  <b>Message us on WhatsApp</b>
                  <span>We usually reply within an hour</span>
                </span>
              </a>
              <a
                className="cs-opt"
                href={`https://wa.me/${tour.phone.replace(
                  /[^\d]/g,
                  ""
                )}?text=${encodeURIComponent(
                  "Hello — I would like to change my booking."
                )}`}
                target="_blank"
                rel="noopener"
              >
                <span>
                  <b>Change a booking</b>
                  <span>Tell us your code and we will sort it</span>
                </span>
              </a>
              <button
                type="button"
                className="cs-opt"
                onClick={() => {
                  setShowService(false);
                  setShowBook(true);
                }}
              >
                <span>
                  <b>Back to booking</b>
                  <span>Reserve your place in a moment</span>
                </span>
              </button>
              <a className="cs-opt" href={`tel:${tour.phone.replace(/\s/g, "")}`}>
                <span>
                  <b>Call us · {tour.phone}</b>
                  <span>09:00–22:00, Monday–Saturday</span>
                </span>
              </a>
            </div>
            <p className="vp-body cs-where">
              Find us at the main pier — Molo dei Pescatori, 19016 Monterosso al
              Mare.
            </p>
            <nav className="vp-nav">
              <button type="button" onClick={openHub}>
                ← Explore
              </button>
            </nav>
          </article>
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
  const [step, setStep] = useState("receipt"); // receipt-first; each step returns to the receipt
  const [done, setDone] = useState(false);
  const [sent, setSent] = useState(false);
  const [slot, setSlot] = useState("sunset");
  const [dateMore, setDateMore] = useState(false);

  useEffect(() => {
    setDays(buildDays(21));
    // smart guess: two places on the next real departure, in Monterosso time.
    const { slot: guessSlot, iso: guessIso } = nextDeparture();
    setSlot(guessSlot);
    setDate((d) => d || guessIso);
  }, []);

  // pick a date tile → set it and return to the receipt
  function pickDate(iso) {
    setError("");
    setDate(iso);
    setStep("receipt");
  }

  // ← / → move between the receipt and each single edit step, then back.
  // Each step is a one-tap change that returns to the receipt.
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (done || sent) return;
        if (step === "receipt") setStep("time");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (done) {
          setDone(false);
          setStep("receipt");
        } else if (step !== "receipt") setStep("receipt");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, done, sent, step]);

  const sel = days.find((d) => d.iso === date);
  const code = makeCode(date, guests);
  const when = sel ? `${sel.label} · ${sel.small}` : date;
  const total = totalFor(guests, slot);
  const slotLabel = tour.slots[slot]?.label || "Sunset";
  // priority-1 booking link: WhatsApp, prefilled from the customer's choices
  const bookingWa = waLink(bookingMessage({ iso: date, slot, guests }));

  // SCREEN 3 — confirmation: combined info + add-to-calendar + share
  if (sent) {
    return (
      <div className="book-form confirm-sent">
        <p className="confirm-lead">
          Thank you — send the message we opened for you, and we will confirm
          your place right there.
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
            <span>Meeting point</span>
            <strong>{MEETING_POINT}</strong>
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
        <p className="cal-label">Add me to your calendar</p>
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
          <a
            className="cal-btn"
            href={outlookCalUrl({ iso: date, guests, total, code, slot })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalGlyph />
            Outlook
          </a>
        </div>
        <button
          type="button"
          className="pay pay--ghost share-btn"
          onClick={() => shareTrip({ when, guests })}
        >
          Tell a friend
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setSent(false);
            setDone(false);
          }}
        >
          Finish
        </button>
      </div>
    );
  }

  if (done) {
    // Save the lead to our backend (D1), then hand off to WhatsApp.
    const saveLead = () => {
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
                slot,
              }),
            ],
            { type: "application/json" }
          )
        );
      } catch {}
    };
    // Priority 1: open WhatsApp with the message built from the choices,
    // then advance to the confirmation screen.
    const bookOnWhatsApp = () => {
      saveLead();
      try {
        window.open(bookingWa, "_blank", "noopener");
      } catch {}
      setSent(true);
    };
    // Email fallback — same booking details, our inbox.
    const bookByEmail = () => {
      saveLead();
      const details = `Monterosso sea tour\nCode: ${code}\n${when} · ${slotLabel} · ${guests} ${
        guests === 1 ? "guest" : "guests"
      } · $${total}\nMeeting point: ${MEETING_POINT}`;
      const mailto = `mailto:${tour.email}?subject=${encodeURIComponent(
        `Booking enquiry — Monterosso sea tour (${code})`
      )}&body=${encodeURIComponent(details)}`;
      try {
        window.location.href = mailto;
      } catch {}
      setSent(true);
    };
    return (
      <div className="book-form">
        <p className="confirm-lead">
          One tap, and we will pick it up on WhatsApp — your message is ready.
        </p>
        <p className="send-summary">
          {when} · {slotLabel} · {guests}{" "}
          {guests === 1 ? "guest" : "guests"} · ${total}
        </p>
        <button type="button" className="pay" onClick={bookOnWhatsApp}>
          Book on WhatsApp
        </button>
        <button type="button" className="pay pay--ghost" onClick={bookByEmail}>
          Or send by email
        </button>
        <p className="field-head wa-alt-head">Or ask us something first</p>
        <div className="wa-alts">
          {WA_ALTS.map((m) => (
            <a
              key={m}
              className="cs-opt wa-alt"
              href={waLink(m)}
              target="_blank"
              rel="noopener"
              onClick={saveLead}
            >
              <span>
                <b>{m}</b>
              </span>
            </a>
          ))}
        </div>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setError("");
            setDone(false);
            setStep("receipt");
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  // SCREEN — RECEIPT: a guessed booking (two places, the next departure),
  // shown first. Send it, or tap "Change the time" to adjust.
  if (step === "receipt") {
    return (
      <div className="book-form">
        <p className="box-count">Your place</p>
        <p className="confirm-lead">
          We have set aside <strong>two seats</strong> on the next sailing.
          Change anything you like, then continue.
        </p>
        <div className="conf-summary">
          <button
            type="button"
            className="conf-row conf-row--edit"
            onClick={() => {
              setError("");
              setStep("date");
            }}
          >
            <span>When</span>
            <strong>{when}</strong>
          </button>
          <button
            type="button"
            className="conf-row conf-row--edit"
            onClick={() => {
              setError("");
              setStep("time");
            }}
          >
            <span>Departure</span>
            <strong>{slotLabel}</strong>
          </button>
          <button
            type="button"
            className="conf-row conf-row--edit"
            onClick={() => {
              setError("");
              setStep("guests");
            }}
          >
            <span>Guests</span>
            <strong>
              {guests} {guests === 1 ? "guest" : "guests"}
            </strong>
          </button>
          <div className="conf-row">
            <span>Meeting point</span>
            <strong>{MEETING_POINT}</strong>
          </div>
          <div className="conf-row">
            <span>Total</span>
            <strong>${total}</strong>
          </div>
        </div>
        <button className="pay" onClick={() => setDone(true)}>
          Continue
        </button>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setError("");
            setStep("time");
          }}
        >
          Change the time
        </button>
      </div>
    );
  }

  // EDIT — guests (single tap returns to the receipt)
  if (step === "guests") {
    return (
      <div className="book-form">
        <span className="field-head step-q">How many of you?</span>
        <div className="choice-grid choice-grid--nums">
          {Array.from({ length: tour.maxGuests }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              className={"choice choice--num" + (guests === n ? " is-sel" : "")}
              onClick={() => {
                setGuests(n);
                setStep("receipt");
              }}
            >
              <span className="choice-label">{n}</span>
            </button>
          ))}
        </div>
        <a className="cs-link guests-more" href={waLink(WA_ALTS[1])} target="_blank" rel="noopener">
          More than {tour.maxGuests}? Ask us ›
        </a>
        <button
          type="button"
          className="confirm__back"
          onClick={() => {
            setError("");
            setStep("receipt");
          }}
        >
          Back
        </button>
        <p className="reassure">No prepayment · from ${tour.priceUsd} per guest</p>
      </div>
    );
  }

  // EDIT — departure time (single tap returns to the receipt)
  if (step === "time") {
    const opts = ["sunrise", "sunshine", "sunset"].map((v) => ({
      v,
      label: tour.slots[v].label,
      window: tour.slots[v].window,
      price: slotPriceUsd(v),
    }));
    return (
      <div className="book-form">
        <span className="field-head step-q">
          What time would you like to leave?
        </span>
        <div className="choice-grid choice-grid--time">
          {opts.map((o) => (
            <button
              type="button"
              key={o.v}
              className={"choice choice--sq" + (slot === o.v ? " is-sel" : "")}
              onClick={() => {
                setSlot(o.v);
                setStep("receipt");
              }}
            >
              <span className="choice-label">{o.label}</span>
              <span className="choice-sub">{o.window}</span>
              <span className="choice-sub">${o.price}/guest</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="confirm__back"
          onClick={() => setStep("receipt")}
        >
          Back
        </button>
      </div>
    );
  }

  // EDIT — date (single tap returns to the receipt)
  return (
    <div className="book-form">
      <span className="field-head step-q">Which day?</span>
      {dateMore ? (
        <div className="choice-grid choice-scroll">
          {days.map((d) => (
            <button
              type="button"
              key={d.iso}
              className={"choice" + (date === d.iso ? " is-sel" : "")}
              onClick={() => pickDate(d.iso)}
            >
              <span className="choice-label">{d.label}</span>
              <span className="choice-sub">{d.small}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="choice-grid choice-grid--days2">
          {days.slice(0, 3).map((d) => (
            <button
              type="button"
              key={d.iso}
              className={"choice choice--sq" + (date === d.iso ? " is-sel" : "")}
              onClick={() => pickDate(d.iso)}
            >
              <span className="choice-label">{d.label}</span>
              <span className="choice-sub">{d.small}</span>
            </button>
          ))}
          <button
            type="button"
            className="choice choice--sq choice--more"
            onClick={() => setDateMore(true)}
          >
            <span className="choice-label">More dates…</span>
          </button>
        </div>
      )}
      <button
        type="button"
        className="confirm__back"
        onClick={() => {
          setError("");
          setStep("receipt");
        }}
      >
        Back
      </button>
      <p className="reassure">No prepayment · from ${tour.priceUsd} per guest</p>
    </div>
  );
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

function outlookCalUrl({ iso, guests, total, code, slot }) {
  const s = tour.slots[slot] || tour.slots.sunset;
  const fmt = (hms) =>
    `${iso}T${hms.slice(0, 2)}:${hms.slice(2, 4)}:${hms.slice(4, 6)}`;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: tour.name,
    startdt: fmt(s.start),
    enddt: fmt(s.end),
    body: calDetails(code, guests, total, slot),
    location: CAL_LOCATION,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
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
      await navigator.share({ title: "Monterosso · Cinque Terre sea tour", text, url });
      return;
    }
  } catch {
    return; // user dismissed the share sheet
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    alert("Link copied — send it to a friend.");
  } catch {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank"
    );
  }
}

/* ---------- WhatsApp (priority-1 booking channel) ----------
   wa.me opens the app on iOS/Android and WhatsApp Web on desktop. */
function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* The next real departure in Monterosso time (Europe/Rome), so the receipt
   guess always lands on an actual, still-bookable slot. We read the current
   hour:minute in Rome, then pick the first slot whose start is still ahead
   today; if the day's last departure has gone, we roll to tomorrow's sunrise.
   Slot order matches tour.js (sunrise → sunshine → sunset). */
function nextDeparture() {
  const order = ["sunrise", "sunshine", "sunset"];
  // current minutes-since-midnight in Europe/Rome
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAL_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const nowMin = hh * 60 + mm;
  const startMin = (s) =>
    Number(s.start.slice(0, 2)) * 60 + Number(s.start.slice(2, 4));
  for (const v of order) {
    if (nowMin < startMin(tour.slots[v])) {
      return { slot: v, iso: romeISO(0) };
    }
  }
  // every departure has passed today → tomorrow's first slot
  return { slot: order[0], iso: romeISO(1) };
}

/* ISO date (YYYY-MM-DD) for "today + offset" as seen in Europe/Rome. */
function romeISO(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // en-CA gives YYYY-MM-DD; tie it to Rome so the calendar day is correct
  return new Intl.DateTimeFormat("en-CA", { timeZone: CAL_TZ }).format(d);
}

/* Natural English day phrase from an ISO date, relative to today:
   "today" / "tomorrow" / "on Friday 27 June". */
function dayPhrase(iso) {
  if (!iso) return "soon";
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "tomorrow";
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return `on ${weekday} ${date}`;
}

/* The prefilled booking message, built from the customer's own choices.
   Neutral skipper name (Kristian confirms the name later). */
function bookingMessage({ iso, slot, guests }) {
  const label = (tour.slots[slot]?.label || "Sunset").toLowerCase();
  const party = `${guests} ${guests === 1 ? "guest" : "guests"}`;
  const emoji = slot === "sunset" ? " 🌅" : slot === "sunrise" ? " 🌄" : " ⛵";
  return `Hi! I'd like to book the ${label} tour ${dayPhrase(iso)} for ${party}${emoji}`;
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
  const rel = ["Today", "Tomorrow", "Day after tomorrow"];
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
    <svg viewBox="0 0 100 100" className="celestial celestial--sun">
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

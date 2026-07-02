"use client";

import { useEffect, useRef, useState } from "react";
import { tour, WHATSAPP_NUMBER, MEETING_POINT, SKIPPER_NAME } from "../../lib/tour";

// 🤍 Built with love on this coast — for vakreste Mandy, always remembered here.
// RETIRED SCENE (reversible): the animated sea scene is no longer rendered —
// a clean Apple hero stands in its place. Re-enable these imports together with
// their JSX (further down) to bring the living scene back, nothing was deleted.
// import Skyline from "./Skyline";
// import "./styles/editoriale.css";
// import "./styles/riviera-deco.css";
// import "./styles/studio.css";
// import "./styles/maritimo.css";
// import "./styles/cartolina.css";
// import "./styles/notturno.css";
// import Boat3D from "./Boat3D";
// import Clouds from "./Clouds";
// import Constellations from "./Constellations";
// import ClockTower from "./ClockTower";
// import Signpost from "./Signpost";
import VillagePage from "./VillagePage";
import { VILLAGES } from "./villageData";

const firstName = (n) => n.split(" ")[0]; // "Monterosso al Mare" → "Monterosso"

// Ready-made WhatsApp openers the customer can pick instead of booking outright.
const WA_ALTS = [
  "Hi! Which times do you have available this week?",
  "Hi! We are four — what is the price for a private tour?",
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
      <path d="M5.5 16.5h13l-1 1.6H6.5z" />
      <path d="M7 13.5h10v3H7z" />
      <path d="M8 13.5c0-3.2 1.8-5.5 4-5.5s4 2.3 4 5.5" />
      <path d="M10.5 15h3" />
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

// Left sidebar — minimal line icons + small labels. Elegant, Apple-quiet.
const NAV_ITEMS = [
  { key: "home", label: "Home", d: "M3 10.7 12 3l9 7.7M5.5 9.5V20h13V9.5" },
  { key: "discover", label: "Discover", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2.2 4.8-4.8 2.2 2.2-4.8z" },
  { key: "tour", label: "The tour", d: "M12 3v18M12 3l7 13H5z" },
  { key: "reviews", label: "Reviews", d: "M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 15.8 7.2 18.3l.9-5.1L4.3 9.5l5.2-.8z" },
  { key: "help", label: "Help", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.6 9.2a2.4 2.4 0 1 1 4.7.7c0 1.5-2.3 1.7-2.3 3.4M12 17h.01" },
];

export default function Landing() {
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

  // Scroll / swipe / button all bring the booking card in as an overlay —
  // same screen, no navigation.
  const [showBook, setShowBook] = useState(false);
  // The docked booking panel's mode: "express" (default, near-zero friction)
  // ↔ "guided" (the existing 5-step wizard). One toggle flips between them.
  const [bookMode, setBookMode] = useState("express");
  const [navOpen, setNavOpen] = useState(true); // left sidebar: default expanded, toggles narrow
  const [navTab, setNavTab] = useState("home");
  const [villageIdx, setVillageIdx] = useState(null); // open village page (0–4) or null
  const [showBoat, setShowBoat] = useState(false); // "the boat & her captain" page
  const [showHub, setShowHub] = useState(false); // "Explore" — the hub of everything
  const [showCaptain, setShowCaptain] = useState(false); // the captain's own page
  const [showNews, setShowNews] = useState(false); // news / from the coast
  const [showService, setShowService] = useState(false); // customer service / help
  // Deep-link a single screen for the flow-overview board (public/flow.html):
  // ?screen=book|boat|hub|captain|news|service|village0..village4 opens it on load.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("screen");
    if (!s) return;
    if (s === "book") setShowBook(true);
    else if (s === "boat") setShowBoat(true);
    else if (s === "hub") setShowHub(true);
    else if (s === "captain") setShowCaptain(true);
    else if (s === "news") setShowNews(true);
    else if (s === "service") setShowService(true);
    else if (s.startsWith("village")) {
      const i = parseInt(s.slice(7), 10);
      if (i >= 0 && i <= 4) setVillageIdx(i);
    }
  }, []);
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
  // Esc closes any open popup. (The booking now lives in the docked panel and
  // scrolls internally, so we no longer auto-open the overlay on wheel/swipe —
  // that would fight the dock's own scrolling.)
  useEffect(() => {
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={"landing-v2" + (anyOpen ? " popup-open" : "")}>
      <Effects />

      {/* RETIRED SCENE (reversible): the animated sea scene — sky/stars/
          Constellations, the aurora sea + sun-glint, Boat3D, Skyline, the
          Signpost/ClockTower village signs, Clouds, the sun/moon theme
          switcher and the photo/style background switchers — is no longer
          rendered. The clean Apple hero below stands in its place. To bring
          the living scene back, re-enable the imports at the top of this file
          and restore their JSX here; no component files were deleted. */}

      <div className="lp-shell">
      <nav
        className={"lp-sidebar" + (navOpen ? "" : " lp-sidebar--collapsed")}
        aria-label="Menu"
      >
        <button
          type="button"
          className="lp-sb-toggle"
          onClick={() => setNavOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="lp-sb-nav">
          {NAV_ITEMS.map((it) => (
            <button
              key={it.key}
              type="button"
              className={"lp-sb-item" + (navTab === it.key ? " sel" : "")}
              onClick={() => setNavTab(it.key)}
            >
              <svg
                className="lp-sb-ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={it.d} />
              </svg>
              <span className="lp-sb-lbl">{it.label}</span>
            </button>
          ))}
        </div>
        <div className="lp-sb-foot">
          <a
            className="lp-sb-item"
            href="https://monterosso-app.kgl-56a.workers.dev/login"
          >
            <svg
              className="lp-sb-ic"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 12a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8zM5.5 19.5a6.5 6.5 0 0 1 13 0" />
            </svg>
            <span className="lp-sb-lbl">Log in</span>
          </a>
        </div>
      </nav>
      <main className="lp">
        <p className="sr-only">
          A private sea tour of the Cinque Terre from Monterosso al Mare,
          Liguria — three unhurried hours along the coast, ${tour.priceUsd} per
          guest. Book in a moment, no prepayment.
        </p>

        {/* HERO — clean Apple front page + the booking CTA */}
        <header className="lp-hero" id="top">
          <p className="lp-eyebrow">Monterosso al Mare</p>
          <h1 className="lp-title">Cinque Terre</h1>
          <p className="lp-tagline">
            A private sail on the Mar Ligure, aboard the Paolona.
          </p>

          <div className="lp-cta-row">
            <button
              type="button"
              className="lp-cta"
              onClick={() => {
                const d = document.querySelector(".lp-dock");
                if (!d) { setShowBook(true); return; }
                d.scrollIntoView({ behavior: "smooth", block: "nearest" });
                d.querySelector("button, a, input, [tabindex]")?.focus?.();
              }}
            >
              Check availability
            </button>
          </div>

          {/* Landing intentionally minimal: only Log in + Check availability.
              The hub / captain / service / village pages stay reachable via
              ?screen= deep links (and from the web dashboard's SEO), not here. */}

          {/* 🤍 for Mandy — the retired scene hid drifting gold hearts that
              secretly spell her name; carried here as a few faint hearts. */}
          {/* Mandy-hjertene — midlertidig av ("vent med de"). Hent tilbake ved å avkommentere:
          <div className="lp-hearts" aria-hidden="true">
            {["M", "A", "N", "D", "Y"].map((letter, i) => (
              <span key={letter} className="lp-heart" data-letter={letter} style={{ "--i": String(i) }}>
                ♥
              </span>
            ))}
          </div>
          */}
        </header>
      </main>

      {/* DOCKED BOOKING — the default, near-zero-friction Express panel docked
          right on desktop (a full-width sheet under the hero on mobile). One
          toggle flips it between Express and the Guided 5-step wizard. */}
      <aside className="lp-dock">
        <div className="lp-box">
        <div className="lp-modebar">
          <button
            type="button"
            className="lp-toggle"
            onClick={() =>
              setBookMode((m) => (m === "express" ? "guided" : "express"))
            }
          >
            <span className="lp-toggle__ic" aria-hidden="true">
              ⇄
            </span>
            {bookMode === "express" ? "Guided steps" : "Express"}
          </button>
        </div>
        {bookMode === "express" ? (
          <ExpressBooking />
        ) : (
          <BookingForm onClose={() => setBookMode("express")} />
        )}
        </div>
      </aside>
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
          <BookingForm onClose={() => setShowBook(false)} />
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
          <article className="village-page vp-apple">
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
                  Check availability →
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
          <article className="village-page vp-apple">
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
          <article className="village-page vp-apple">
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
          <article className="village-page vp-apple">
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
          <article className="village-page vp-apple">
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

// The guided booking wizard: 01 Tour · 02 Date · 03 Departure · 04 Guests ·
// 05 Summary (+ contact). Rendered in our glass/sharp design system. Tours and
// prices are read from lib/tour.js so the flow stays data-driven.
const STEP_LABELS = ["Tour", "Date", "Departure", "Guests", "Summary"];

function BookingForm({ onClose }) {
  // Data-driven from tour.js — one tour today, but the step scales if more are
  // added later. The single tour is pre-selected so step 01 confirms the boat.
  const TOURS = [tour];
  const now = new Date();

  const [step, setStep] = useState(0);
  const [tourIdx, setTourIdx] = useState(0);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [guests, setGuests] = useState(2);
  const [calY, setCalY] = useState(now.getFullYear());
  const [calM, setCalM] = useState(now.getMonth());
  const [contactMode, setContactMode] = useState(""); // "saved" | "email"
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resCode, setResCode] = useState("");
  const [synced, setSynced] = useState(false);

  // Returning visitor (we left a marker last time) → offer saved details first.
  useEffect(() => {
    try {
      if (localStorage.getItem("mtr_returning")) setContactMode("saved");
    } catch {}
  }, []);

  // Deep-link a single wizard step for the flow-overview board (public/flow.html):
  // ?screen=book&step=date|time|guests|done|sent jumps straight to it.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("screen") !== "book") return;
    const st = sp.get("step");
    if (st === "sent") setDone(true);
    else if (st === "date") setStep(1);
    else if (st === "time") setStep(2);
    else if (st === "guests") setStep(3);
    else if (st === "done") setStep(4);
  }, []);

  const selTour = TOURS[tourIdx] || tour;
  const maxGuests = selTour.maxGuests;
  const total = totalFor(guests, slot || "sunshine");
  const slotLabel = tour.slots[slot]?.label || "—";
  const slotWindow = tour.slots[slot]?.window || "";
  const when = fmtNice(date);

  const stepValid =
    step === 0
      ? tourIdx != null
      : step === 1
      ? !!date
      : step === 2
      ? !!slot
      : step === 3
      ? guests >= 1 && guests <= maxGuests
      : true;
  const canSubmit =
    tourIdx != null &&
    !!date &&
    !!slot &&
    guests >= 1 &&
    (contactMode === "saved" || (contactMode === "email" && validEmail(email)));

  // Lead capture to our backend (D1), best-effort — never blocks the page.
  function saveLead(code) {
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
              email: contactMode === "email" ? email : null,
            }),
          ],
          { type: "application/json" }
        )
      );
    } catch {}
  }

  // THE booking action. Sends the request, shows our confirmation.
  async function onCheck() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const booking = {
      tour: selTour.name,
      date,
      slot,
      guests,
      total,
      email: contactMode === "email" ? email : null,
      contactMode,
    };
    const { code, synced: didSync } = await submitBookingRequest(booking);
    saveLead(code);
    try {
      localStorage.setItem("mtr_returning", "1");
      if (contactMode === "email" && email) localStorage.setItem("mtr_email", email);
    } catch {}
    setResCode(code);
    setSynced(didSync);
    setSubmitting(false);
    setDone(true);
  }

  function onBack() {
    if (step === 0) onClose?.();
    else setStep((s) => s - 1);
  }
  function onNext() {
    if (stepValid) setStep((s) => Math.min(4, s + 1));
  }

  const atCurrentMonth = calY === now.getFullYear() && calM === now.getMonth();
  function prevMonth() {
    if (atCurrentMonth) return;
    let m = calM - 1,
      y = calY;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    setCalM(m);
    setCalY(y);
  }
  function nextMonth() {
    let m = calM + 1,
      y = calY;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setCalM(m);
    setCalY(y);
  }

  // CONFIRMATION — soft, honest: a request is on its way, the account is ready.
  // Shared with the Express panel so both booking paths land on the identical
  // "Request sent" receipt (+ calendar / WhatsApp).
  if (done) {
    return (
      <Confirmation
        tourName={selTour.name}
        date={date}
        slot={slot}
        guests={guests}
        total={total}
        resCode={resCode}
        synced={synced}
      />
    );
  }

  return (
    <div className="book-form wiz-apple">
      {/* numbered progress header + gold bar */}
      <div className="wiz-steps">
        <div className="wiz-row">
          {STEP_LABELS.map((label, i) => (
            <button
              type="button"
              key={label}
              className={
                "wiz-step" +
                (i === step ? " is-active" : "") +
                (i < step ? " is-done" : "")
              }
              onClick={() => setStep(i)}
            >
              <span className="wiz-step__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="wiz-step__lbl">{label}</span>
            </button>
          ))}
        </div>
        <div className="wiz-bar">
          <div
            className="wiz-bar__fill"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* 01 — TOUR */}
      {step === 0 && (
        <div className="wiz-body">
          <span className="field-head step-q">Choose your tour</span>
          <div className="choice-grid">
            {TOURS.map((tr, i) => (
              <button
                type="button"
                key={tr.name}
                className={
                  "choice choice--tour" + (tourIdx === i ? " is-sel" : "")
                }
                onClick={() => setTourIdx(i)}
              >
                <span className="choice-label">{tr.name}</span>
                <span className="choice-sub">
                  ~{tr.durationHours} hours · ${tr.priceUsd} {tr.unit}
                </span>
                <span className="choice-sub">{tr.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 02 — DATE */}
      {step === 1 && (
        <div className="wiz-body">
          <span className="field-head step-q">Choose a date</span>
          <div className="wiz-cal">
            <div className="wiz-cal__head">
              <button
                type="button"
                className="wiz-cal__nav"
                onClick={prevMonth}
                disabled={atCurrentMonth}
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="wiz-cal__title">
                {MONTHS[calM]} {calY}
              </span>
              <button
                type="button"
                className="wiz-cal__nav"
                onClick={nextMonth}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <div className="wiz-cal__grid">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="wiz-cal__wd">
                  {wd}
                </div>
              ))}
              {monthWeeks(calY, calM).map((cell, idx) => {
                if (!cell)
                  return (
                    <span
                      key={"b" + idx}
                      className="wiz-cal__day wiz-cal__day--blank"
                      aria-hidden="true"
                    />
                  );
                const past = cell.iso < todayISO();
                return (
                  <button
                    type="button"
                    key={cell.iso}
                    className={
                      "wiz-cal__day" + (date === cell.iso ? " is-sel" : "")
                    }
                    disabled={past}
                    onClick={() => setDate(cell.iso)}
                  >
                    {cell.d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 03 — DEPARTURE */}
      {step === 2 && (
        <div className="wiz-body">
          <span className="field-head step-q">Choose a departure</span>
          <div className="choice-grid choice-grid--time">
            {["sunrise", "sunshine", "sunset"].map((v) => (
              <button
                type="button"
                key={v}
                className={"choice choice--sq" + (slot === v ? " is-sel" : "")}
                onClick={() => setSlot(v)}
              >
                <span className="choice-label">{tour.slots[v].label}</span>
                <span className="choice-sub">{tour.slots[v].window}</span>
                <span className="choice-sub">${slotPriceUsd(v)}/guest</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 04 — GUESTS */}
      {step === 3 && (
        <div className="wiz-body">
          <span className="field-head step-q">How many guests?</span>
          <div className="wiz-guests">
            <button
              type="button"
              className="wiz-pm"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              aria-label="Fewer guests"
            >
              −
            </button>
            <div className="wiz-count">
              <div className="wiz-count__n">{guests}</div>
              <div className="wiz-count__w">
                {guests === 1 ? "Guest" : "Guests"}
              </div>
            </div>
            <button
              type="button"
              className="wiz-pm"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              disabled={guests >= maxGuests}
              aria-label="More guests"
            >
              +
            </button>
          </div>
          <a
            className="cs-link guests-more"
            href={waLink(WA_ALTS[1])}
            target="_blank"
            rel="noopener"
          >
            More than {maxGuests}? Ask us ›
          </a>
        </div>
      )}

      {/* 05 — SUMMARY + CONTACT */}
      {step === 4 && (
        <div className="wiz-body">
          <span className="field-head step-q">Your reservation</span>
          <div className="conf-summary">
            <div className="conf-row">
              <span>Tour</span>
              <strong>{selTour.name}</strong>
            </div>
            <div className="conf-row">
              <span>Date</span>
              <strong>{when}</strong>
            </div>
            <div className="conf-row">
              <span>Departure</span>
              <strong>
                {slotLabel}
                {slotWindow ? ` · ${slotWindow}` : ""}
              </strong>
            </div>
            <div className="conf-row">
              <span>Guests</span>
              <strong>
                {guests} {guests === 1 ? "guest" : "guests"}
              </strong>
            </div>
            <div className="conf-row conf-row--total">
              <span>Total</span>
              <strong>${total}</strong>
            </div>
          </div>
          <div className="wiz-contact">
            <button
              type="button"
              className={
                "wiz-contact__btn" + (contactMode === "saved" ? " is-sel" : "")
              }
              onClick={() => setContactMode("saved")}
            >
              Use my saved details
            </button>
            <button
              type="button"
              className={
                "wiz-contact__btn" + (contactMode === "email" ? " is-sel" : "")
              }
              onClick={() => setContactMode("email")}
            >
              Enter email
            </button>
          </div>
          {contactMode === "saved" && (
            <p className="wiz-saved-note">
              We&rsquo;ll use the details we have saved for you.
            </p>
          )}
          {contactMode === "email" && (
            <div className="wiz-email">
              <input
                type="email"
                inputMode="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* footer: Back always · Continue on 01–04 · the CTA on 05 */}
      <div className="wiz-foot">
        <button type="button" className="wiz-back" onClick={onBack}>
          ‹ Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            className="pay wiz-next"
            onClick={onNext}
            disabled={!stepValid}
          >
            Continue ›
          </button>
        ) : (
          <button
            type="button"
            className="pay wiz-next"
            onClick={onCheck}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Sending…" : "Check availability"}
          </button>
        )}
      </div>
    </div>
  );
}

// The "Request sent" receipt — shared by the Guided wizard and the Express
// panel so both paths show the identical confirmation (+ add-to-calendar and
// the WhatsApp fallback). Values are computed from the booking props.
function Confirmation({ tourName, date, slot, guests, total, resCode, synced }) {
  const when = fmtNice(date);
  const slotLabel = tour.slots[slot]?.label || "—";
  const slotWindow = tour.slots[slot]?.window || "";
  const bookingWa = waLink(bookingMessage({ iso: date, slot, guests }));
  const bookingSms = smsLink(bookingMessage({ iso: date, slot, guests }));
  return (
    <div className="book-form wiz-apple">
      <h3 className="wiz-done__h">Request sent</h3>
      <p className="confirm-lead">
        We&rsquo;re checking availability with the skipper — you&rsquo;ll hear
        back shortly.{" "}
        {synced ? "Your account is ready." : "We’ve noted your request."}
      </p>
      <div className="conf-summary">
        <div className="conf-row conf-row--code">
          <span>Reservation</span>
          <strong>{resCode}</strong>
        </div>
        <div className="conf-row">
          <span>Tour</span>
          <strong>{tourName}</strong>
        </div>
        <div className="conf-row">
          <span>Date</span>
          <strong>{when}</strong>
        </div>
        <div className="conf-row">
          <span>Departure</span>
          <strong>
            {slotLabel}
            {slotWindow ? ` · ${slotWindow}` : ""}
          </strong>
        </div>
        <div className="conf-row">
          <span>Guests</span>
          <strong>
            {guests} {guests === 1 ? "guest" : "guests"}
          </strong>
        </div>
        <div className="conf-row">
          <span>Meeting point</span>
          <strong>{MEETING_POINT}</strong>
        </div>
        <div className="conf-row conf-row--total">
          <span>Total</span>
          <strong>${total}</strong>
        </div>
      </div>
      <a
        className="conf-cta"
        href="https://monterosso-app.kgl-56a.workers.dev/login"
      >
        Open my account
      </a>
      <p className="cal-label">Add me to your calendar</p>
      <div className="cal-row">
        <a
          className="cal-btn"
          href={googleCalUrl({ iso: date, guests, total, code: resCode, slot })}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CalGlyph />
          Google
        </a>
        <button
          type="button"
          className="cal-btn"
          onClick={() =>
            downloadIcs({ iso: date, guests, total, code: resCode, slot })
          }
        >
          <CalGlyph />
          Apple
        </button>
        <a
          className="cal-btn"
          href={outlookCalUrl({ iso: date, guests, total, code: resCode, slot })}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CalGlyph />
          Outlook
        </a>
      </div>
      <a className="wiz-wa" href={bookingWa} target="_blank" rel="noopener">
        Prefer WhatsApp? Message us
      </a>
      <a className="wiz-wa" href={bookingSms}>
        Or send an SMS
      </a>
    </div>
  );
}

// The next upcoming departure, in the viewer's local time: the first slot today
// whose start hasn't passed yet, else the first slot tomorrow. Pre-selecting it
// is the whole point of Express — near-zero friction.
const SLOT_ORDER = ["sunrise", "sunshine", "sunset"];

// The whole point of this section: three suns across the day — a morning sun low
// on the left, a high midday sun in the middle, an evening sun low on the right.
const SUNS = {
  sunrise: (
    <svg viewBox="0 0 46 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="21" x2="43" y2="21" strokeOpacity="0.35" />
      <circle cx="14" cy="21" r="5.5" fill="currentColor" stroke="none" />
      <line x1="14" y1="10" x2="14" y2="7" />
      <line x1="7" y1="13.5" x2="5.5" y2="12" />
      <line x1="21" y1="13.5" x2="22.5" y2="12" />
    </svg>
  ),
  sunshine: (
    <svg viewBox="0 0 46 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="23" cy="13" r="5" fill="currentColor" stroke="none" />
      <line x1="23" y1="3" x2="23" y2="5.5" />
      <line x1="23" y1="20.5" x2="23" y2="23" />
      <line x1="13" y1="13" x2="15.5" y2="13" />
      <line x1="30.5" y1="13" x2="33" y2="13" />
      <line x1="16" y1="6" x2="17.8" y2="7.8" />
      <line x1="28.2" y1="18.2" x2="30" y2="20" />
      <line x1="30" y1="6" x2="28.2" y2="7.8" />
      <line x1="17.8" y1="18.2" x2="16" y2="20" />
    </svg>
  ),
  sunset: (
    <svg viewBox="0 0 46 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="21" x2="43" y2="21" strokeOpacity="0.35" />
      <circle cx="32" cy="21" r="5.5" fill="currentColor" stroke="none" />
      <line x1="32" y1="10" x2="32" y2="7" />
      <line x1="25" y1="13.5" x2="23.5" y2="12" />
      <line x1="39" y1="13.5" x2="40.5" y2="12" />
    </svg>
  ),
};
function nextDeparture() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const key of SLOT_ORDER) {
    const s = tour.slots[key].start; // "HHMMSS"
    const startMin = parseInt(s.slice(0, 2), 10) * 60 + parseInt(s.slice(2, 4), 10);
    if (nowMin < startMin) return { date: todayISO(), slot: key };
  }
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return { date: t.toLocaleDateString("sv-SE"), slot: SLOT_ORDER[0] };
}
/* "07:00" from a slot's HHMMSS start. */
function slotStartHHMM(slot) {
  const s = tour.slots[slot]?.start || "170000";
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}
/* "Today" / "Tomorrow" / "Fri 3 Jul" for the departure card. */
function relDayLabel(iso) {
  if (iso === todayISO()) return "Today";
  const t = new Date();
  t.setDate(t.getDate() + 1);
  if (iso === t.toLocaleDateString("sv-SE")) return "Tomorrow";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// EXPRESS booking — the default, docked panel. The next departure is
// pre-selected; the guest picks an experience, party size, and one contact
// method, then Reserve → the same submitBookingRequest + shared Confirmation.
function ExpressBooking() {
  const init = nextDeparture();
  const now = new Date();

  const [date, setDate] = useState(init.date);
  const [slot, setSlot] = useState(init.slot);
  const [guests, setGuests] = useState(2);
  const [showPicker, setShowPicker] = useState(false);
  const [calY, setCalY] = useState(now.getFullYear());
  const [calM, setCalM] = useState(now.getMonth());
  const [contactMode, setContactMode] = useState(""); // "saved" | "email"
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resCode, setResCode] = useState("");
  const [synced, setSynced] = useState(false);

  // Live skipper status ("available" | "booked" | "away"), or null while loading / on error —
  // null means we render NOTHING (never claim a status we don't truthfully have). Backed by the
  // real presence endpoint (skipper 1 = Andrea), polled every ~45s.
  const [liveStatus, setLiveStatus] = useState(null);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`${CHAT_API_BASE}/public/skippers/1/status`);
        if (!res.ok) throw new Error("status");
        const data = await res.json();
        const s = data && data.status;
        if (active && (s === "available" || s === "booked" || s === "away")) setLiveStatus(s);
        else if (active) setLiveStatus(null);
      } catch {
        if (active) setLiveStatus(null); // on error, claim nothing
      }
    }
    load();
    const id = setInterval(load, 45000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Returning visitor → offer saved details first (same marker as the wizard).
  useEffect(() => {
    try {
      if (localStorage.getItem("mtr_returning")) setContactMode("saved");
    } catch {}
  }, []);

  const maxGuests = tour.maxGuests;
  const total = totalFor(guests, slot);
  const canSubmit =
    !!date &&
    !!slot &&
    guests >= 1 &&
    (contactMode === "saved" || (contactMode === "email" && validEmail(email)));

  const atCurrentMonth = calY === now.getFullYear() && calM === now.getMonth();
  function prevMonth() {
    if (atCurrentMonth) return;
    let m = calM - 1,
      y = calY;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    setCalM(m);
    setCalY(y);
  }
  function nextMonth() {
    let m = calM + 1,
      y = calY;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setCalM(m);
    setCalY(y);
  }

  async function onReserve() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const booking = {
      tour: tour.name,
      date,
      slot,
      guests,
      total,
      email: contactMode === "email" ? email : null,
      contactMode,
    };
    const { code, synced: didSync } = await submitBookingRequest(booking);
    // Lead capture (best-effort, mirrors the wizard) — never blocks.
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
              email: contactMode === "email" ? email : null,
            }),
          ],
          { type: "application/json" }
        )
      );
    } catch {}
    try {
      localStorage.setItem("mtr_returning", "1");
      if (contactMode === "email" && email)
        localStorage.setItem("mtr_email", email);
    } catch {}
    setResCode(code);
    setSynced(didSync);
    setSubmitting(false);
    setDone(true);
  }

  if (done)
    return (
      <Confirmation
        tourName={tour.name}
        date={date}
        slot={slot}
        guests={guests}
        total={total}
        resCode={resCode}
        synced={synced}
      />
    );

  // .wiz-apple scope → the revealed calendar + input inherit the Apple
  // white-glass styling; .lp-dock flattens this wrapper's own card chrome.
  return (
    <div className="lp-express wiz-apple">
      {/* Live availability for Paolona — this front page is tied to the one skipper (Andrea).
          Real status from the presence endpoint; render nothing until we truthfully know it. */}
      {liveStatus && (
        <div className={`lp-status lp-status--${liveStatus}`}>
          <span className="lp-status__dot" aria-hidden="true" />
          {liveStatus === "available" ? (
            <span>
              <b>Paolona</b> · available now
            </span>
          ) : liveStatus === "booked" ? (
            <span>
              <b>Paolona</b> · out on a tour right now
            </span>
          ) : (
            <span>
              <b>Paolona</b> · send a message to check
            </span>
          )}
        </div>
      )}
      <div className="lp-label">Choose your experience</div>
      <div className="lp-exps">
        {SLOT_ORDER.map((v) => (
          <button
            type="button"
            key={v}
            className={"lp-exp" + (slot === v ? " sel" : "")}
            onClick={() => setSlot(v)}
          >
            <span className="lp-exp__sun">{SUNS[v]}</span>
            <span className="lp-exp__n">{tour.slots[v].label}</span>
          </button>
        ))}
      </div>
      <div className="lp-eyebrow2">
        <span className="lp-dot" aria-hidden="true" />
        Next available departure
      </div>
      <div className="lp-dep">
        <div>
          <div className="lp-dep__h">
            {relDayLabel(date)} · {slotStartHHMM(slot)}
          </div>
          <div className="lp-dep__sub">{tour.slots[slot].label}</div>
        </div>
        <div className="lp-dep__check" aria-hidden="true">
          ✓
        </div>
      </div>
      <button
        type="button"
        className="lp-change"
        onClick={() => setShowPicker((s) => !s)}
      >
        Change date &amp; time
      </button>

      {showPicker && (
        <div className="wiz-cal lp-cal">
          <div className="wiz-cal__head">
            <button
              type="button"
              className="wiz-cal__nav"
              onClick={prevMonth}
              disabled={atCurrentMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="wiz-cal__title">
              {MONTHS[calM]} {calY}
            </span>
            <button
              type="button"
              className="wiz-cal__nav"
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="wiz-cal__grid">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="wiz-cal__wd">
                {wd}
              </div>
            ))}
            {monthWeeks(calY, calM).map((cell, idx) => {
              if (!cell)
                return (
                  <span
                    key={"b" + idx}
                    className="wiz-cal__day wiz-cal__day--blank"
                    aria-hidden="true"
                  />
                );
              const past = cell.iso < todayISO();
              return (
                <button
                  type="button"
                  key={cell.iso}
                  className={
                    "wiz-cal__day" + (date === cell.iso ? " is-sel" : "")
                  }
                  disabled={past}
                  onClick={() => {
                    setDate(cell.iso);
                    setShowPicker(false);
                  }}
                >
                  {cell.d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="lp-grow">
        <div>
          <div className="lp-label lp-label--tight">How many guests?</div>
          <div className="lp-stepper">
            <button
              type="button"
              className="lp-step"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              aria-label="Fewer guests"
            >
              −
            </button>
            <span className="lp-gcount">{guests}</span>
            <button
              type="button"
              className="lp-step"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              disabled={guests >= maxGuests}
              aria-label="More guests"
            >
              +
            </button>
          </div>
        </div>
        <div className="lp-total">
          <div className="lp-total__lbl">Total</div>
          <div className="lp-total__val">${total}</div>
        </div>
      </div>

      <hr className="lp-hr" />
      <div className="lp-contact">
        <button
          type="button"
          className={"lp-cbtn" + (contactMode === "saved" ? " sel" : "")}
          onClick={() => setContactMode("saved")}
        >
          Use my saved details
        </button>
        <button
          type="button"
          className={"lp-cbtn" + (contactMode === "email" ? " sel" : "")}
          onClick={() => setContactMode("email")}
        >
          Enter email
        </button>
      </div>
      {contactMode === "email" && (
        <div className="lp-email">
          <input
            type="email"
            inputMode="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}
      <button
        type="button"
        className={"lp-reserve" + (canSubmit ? " on" : "")}
        onClick={onReserve}
        disabled={!canSubmit || submitting}
      >
        {submitting ? "Sending…" : "Reserve"}
      </button>
      {/* TODO: live-reflect the company's Google Reviews (Places API — needs the
          Google Business place-id + an API key; cache server-side). Hardcoded for now. */}
      <div className="lp-rating">
        <svg className="lp-rating__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <span className="lp-rating__num">4.98</span>
        <span className="lp-rating__lbl">Google reviews</span>
      </div>
    </div>
  );
}

/* Lightweight email check for the contact step. */
function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
}

// Chat/booking API (baatchat Worker). The public booking endpoint creates an instant
// customer account + a 'requested' reservation for the pilot skipper in one call.
const CHAT_API_BASE = "https://monterosso-chat.kgl-56a.workers.dev";

// Wire to the chat backend: create the instant customer account + reservation(status='requested').
// On ANY failure (network/validation/etc.) we fall back to a locally-generated code so the
// customer experience — the "Request sent" confirmation + WhatsApp fallback — never breaks.
async function submitBookingRequest(booking) {
  // synced:false marks a local-only fallback code (no backend account created);
  // synced:true means the request actually reached the backend and an account exists.
  const fallback = { code: makeCode(booking.date, booking.guests), synced: false };
  // In "saved" mode there's no freshly-typed email — reuse the one we stored on a
  // previous successful booking so returning customers still hit the backend.
  let email = booking.email;
  if (!email) {
    try {
      email = localStorage.getItem("mtr_email") || null;
    } catch {}
  }
  if (!email) return fallback; // genuinely no email on file → local code only
  try {
    const res = await fetch(`${CHAT_API_BASE}/public/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour: booking.tour,
        date: booking.date,
        time: booking.slot,
        guests: booking.guests,
        email,
      }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return data?.code ? { code: data.code, synced: true } : fallback;
  } catch {
    return fallback;
  }
}

/* Month calendar helpers (Monday-first) for the date step. */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
/* Today as a local ISO date (YYYY-MM-DD) — string compare gates past days. */
function todayISO() {
  return new Date().toLocaleDateString("sv-SE");
}
/* Weeks of {d, iso} cells (null = leading/trailing blank) for one month. */
function monthWeeks(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    cells.push({ d, iso });
  }
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(...cells.slice(i, i + 7));
  return weeks;
}
/* Friendly date phrase for the summary, e.g. "Fri 3 July 2026". */
function fmtNice(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* Reservation code — a memorable Italian word-pair the guest & skipper read back,
   e.g. "AMORE-ROSSO-07". Deterministic from date+guests so it stays stable across renders. */
const CODE_WORDS_A = [
  "AMORE", "CUORE", "BACIO", "TESORO", "DOLCE", "SOLE", "LUNA", "STELLA",
  "SIRENA", "VELA", "ONDA", "FARO", "GABBIANO", "ORO",
];
const CODE_WORDS_B = [
  "ROSSO", "AZZURRO", "TERRE", "MARE", "VENTO", "GOLFO", "RIVA", "SCOGLIO",
  "LIMONE", "BASILICO", "BARCA", "RIVIERA", "CORALLO", "MONTEROSSO",
];
function makeCode(iso, guests) {
  let h = 0;
  const seed = `${iso}-${guests}`;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = CODE_WORDS_A[h % CODE_WORDS_A.length];
  const b = CODE_WORDS_B[Math.floor(h / CODE_WORDS_A.length) % CODE_WORDS_B.length];
  const n = String((h % 90) + 10); // 10–99, keeps codes unique-looking
  return `${a}-${b}-${n}`;
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

/* ---------- WhatsApp (priority-1 booking channel) ----------
   wa.me opens the app on iOS/Android and WhatsApp Web on desktop. */
function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* SMS fallback — works to any number (no WhatsApp needed). Phase-1 the traveler
   may reach the skipper by WhatsApp OR SMS; later it's in-app chat only. */
function smsLink(text) {
  return `sms:+${WHATSAPP_NUMBER}?&body=${encodeURIComponent(text)}`;
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

"use client";

import { useEffect, useState } from "react";

import { resolvePalette } from "../../../lib/skippers";

// A skipper's public landing — hero, the offer/tours, a booking CTA — rendered
// ENTIRELY from `config`. The chosen theme + day/night mode drive the palette.
//
// Day/night: "day"/"night" are pinned; "auto" follows the VIEWER's local time.
// We start from a deterministic palette (night only if explicitly pinned) so the
// server render and first client paint match, then correct "auto" after mount.
function resolveNight(mode) {
  if (mode === "night") return true;
  if (mode === "day") return false;
  const h = new Date().getHours();
  return h < 7 || h >= 19; // auto: night from 19:00 to 07:00, viewer-local
}

export default function SkipperLanding({ config }) {
  const mode = config.theme?.dayNight ?? "day";
  const [isNight, setIsNight] = useState(mode === "night");

  useEffect(() => {
    setIsNight(resolveNight(mode));
  }, [mode]);

  const p = resolvePalette(config.theme, isNight);
  const style = {
    "--bg": p.bg,
    "--surface": p.surface,
    "--ink": p.ink,
    "--muted": p.muted,
    "--accent": p.accent,
    "--on-accent": p.onAccent,
    "--line": p.line,
  };

  const cur = config.currency ?? "€";
  const fromPrice =
    config.tours && config.tours.length
      ? Math.min(...config.tours.map((t) => t.price ?? config.pricePerGuest))
      : config.pricePerGuest;
  const rating = config.social?.tripadvisorRating;
  const reviews = config.social?.tripadvisorReviews;
  const waHref = config.whatsapp ? `https://wa.me/${config.whatsapp}` : null;

  return (
    <main className="skipper" data-mode={isNight ? "night" : "day"} style={style}>
      {/* ---------- Hero ---------- */}
      <header className="sk-hero">
        <p className="sk-eyebrow">{config.location}</p>
        <h1 className="sk-title">{config.listingTitle}</h1>
        <p className="sk-tagline">{config.tagline}</p>
        {config.intro && <p className="sk-intro">{config.intro}</p>}

        <div className="sk-meta">
          <span>
            from {cur}
            {fromPrice} <em>per guest</em>
          </span>
          <span className="sk-dot" aria-hidden />
          <span>up to {config.maxGuests} guests</span>
          {rating && (
            <>
              <span className="sk-dot" aria-hidden />
              <span>
                {rating} · {reviews} reviews
              </span>
            </>
          )}
        </div>

        <div className="sk-cta-row">
          <a className="sk-cta" href="/">
            Check availability
          </a>
          {waHref && (
            <a className="sk-cta-ghost" href={waHref} target="_blank" rel="noopener noreferrer">
              Message {config.captain}
            </a>
          )}
        </div>
      </header>

      {/* ---------- The offer / tours ---------- */}
      <section className="sk-section" aria-labelledby="sk-tours-h">
        <h2 id="sk-tours-h" className="sk-section-h">
          The tours
        </h2>
        <div className="sk-tours">
          {config.tours.map((t) => (
            <article key={t.key ?? t.name} className="sk-tour">
              <div className="sk-tour-head">
                <h3 className="sk-tour-name">{t.name}</h3>
                <span className="sk-tour-price">
                  {cur}
                  {t.price}
                  <em>/guest</em>
                </span>
              </div>
              <p className="sk-tour-dur">{t.duration}</p>
              <p className="sk-tour-desc">{t.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Meeting point + boat ---------- */}
      <section className="sk-section sk-detail">
        <div className="sk-detail-item">
          <p className="sk-detail-k">Where we meet</p>
          <p className="sk-detail-v">{config.meetingPoint}</p>
        </div>
        <div className="sk-detail-item">
          <p className="sk-detail-k">The boat</p>
          <p className="sk-detail-v">
            {config.boatName} — {config.boatType}
          </p>
        </div>
        <div className="sk-detail-item">
          <p className="sk-detail-k">Your captain</p>
          <p className="sk-detail-v">
            {config.captain}
            {config.coCaptain ? ` & ${config.coCaptain}` : ""}
            {config.since ? `, since ${config.since}` : ""}
          </p>
        </div>
      </section>

      {/* ---------- Booking CTA band ---------- */}
      <section className="sk-book">
        <h2 className="sk-book-h">Come aboard</h2>
        <p className="sk-book-sub">
          A private day on the Ligurian blue, {cur}
          {fromPrice} per guest. Tell {config.captain} the day and the hour.
        </p>
        <div className="sk-cta-row sk-cta-center">
          <a className="sk-cta" href="/">
            Check availability
          </a>
          {waHref && (
            <a className="sk-cta-ghost" href={waHref} target="_blank" rel="noopener noreferrer">
              WhatsApp {config.phone}
            </a>
          )}
        </div>
      </section>

      <footer className="sk-foot">
        <span>{config.listingTitle}</span>
        <span className="sk-dot" aria-hidden />
        <span>{config.location}</span>
        {config.social?.instagram && (
          <>
            <span className="sk-dot" aria-hidden />
            <a href={config.social.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </>
        )}
      </footer>
    </main>
  );
}

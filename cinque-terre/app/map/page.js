import "./map.css";
import { tour } from "../../lib/tour";

export const metadata = { title: "Flow map · Monterosso" };

const VILLAGES = [
  "Monterosso",
  "Vernazza",
  "Corniglia",
  "Manarola",
  "Riomaggiore",
];

const STEPS = [
  { t: "Date", d: "“Which day?” — Today / Tomorrow / Day after / Another day…" },
  { t: "Guests", d: "“How many in your party?” — 1–8" },
  { t: "Departure", d: "🌅 Sunrise 07–09 ($150) · 🌇 Sunset 14–20 ($100)" },
  { t: "Aboard", d: "“Will anyone require a hand coming aboard?” — Yes / No" },
  { t: "Confirm & send", d: "Phone/WhatsApp + email · send via WhatsApp/Email" },
  { t: "Receipt", d: "Summary + code · add to calendar · share" },
];

export default function FlowMap() {
  return (
    <main className="flowmap">
      <div className="fm-head">
        <h1>Flow map — Monterosso · Cinque Terre</h1>
        <p>
          The whole journey on one canvas: what’s live today, and where we’re
          adding the SEO cards as destinations when a guest backs out of
          booking. Internal planning page — not linked from the site.
        </p>
      </div>

      <div className="fm-legend">
        <span>
          <i className="fm-dot fm-dot--live" /> Live today
        </span>
        <span>
          <i className="fm-dot fm-dot--plan" /> Planned (SEO + exit routing)
        </span>
      </div>

      {/* ---------------- LIVE ---------------- */}
      <div className="fm-phase">Live today</div>

      <div className="fm-node">
        <div className="fm-kind">Screen 1 · landing</div>
        <h3>Front page (hero)</h3>
        <ul>
          <li>Eyebrow: “Monterosso al Mare”</li>
          <li>H1: “Cinque Terre”</li>
          <li>Tagline: “A private sail on the Mar Ligure, aboard the Paolona.”</li>
          <li>Scroll hint: “Andiamo” (bottom)</li>
        </ul>
        <p className="fm-cta-line">▸ CTA “Come aboard” →</p>
      </div>

      <div className="fm-arrow">
        ↓<small>opens</small>
      </div>

      <div className="fm-node">
        <div className="fm-kind">Popup #1 · overlay</div>
        <h3>Booking</h3>
        <div className="fm-steps">
          {STEPS.map((s, i) => (
            <div className="fm-step" key={s.t}>
              <span className="fm-n">{i + 1}</span>
              <div>
                <b>{s.t}</b>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="fm-exit">
          <b>✕ Cancel / close (any step)</b> → opens the “Before you go”
          window: the family story + <b>Weddings aboard · all-inclusive, from
          $1,500</b> + enquire (WhatsApp / email / call). The luxurious reveal —
          not linked from the front page.
        </div>
      </div>

      {/* ---------------- PLANNED ---------------- */}
      <div className="fm-phase">Planned — exit routing + SEO cards</div>

      <div className="fm-arrow">
        ↓<small>on cancel / “read more”, land here instead of leaving</small>
      </div>

      <div className="fm-node fm-node--plan">
        <div className="fm-kind">New · retention + SEO hub</div>
        <h3>“Read more about the Cinque Terre”</h3>
        <ul>
          <li>Catches guests who back out — keeps them on the page.</li>
          <li>Indexable content → better search ranking for this service.</li>
          <li>Each card can lead back to booking (“Come aboard”).</li>
        </ul>
      </div>

      <div className="fm-arrow">↓</div>

      <div className="fm-seo-grid">
        <div className="fm-node fm-node--plan">
          <div className="fm-kind">SEO card</div>
          <h3>The five villages</h3>
          <p style={{ opacity: 0.85, fontSize: "0.9rem" }}>
            One descriptive block per village — strong place-name keywords.
          </p>
          <div className="fm-villages">
            {VILLAGES.map((v) => (
              <span className="fm-chip" key={v}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="fm-node fm-node--plan">
          <div className="fm-kind">SEO card</div>
          <h3>FAQ</h3>
          <ul>
            <li>Price (from ${tour.priceUsd}/guest)</li>
            <li>Duration & departures</li>
            <li>What’s included</li>
            <li>Cancellation</li>
          </ul>
        </div>

        <div className="fm-node fm-node--plan">
          <div className="fm-kind">SEO card</div>
          <h3>What’s included / the day</h3>
          <ul>
            <li>Your own boat</li>
            <li>Swim stop</li>
            <li>Ligurian aperitivo</li>
            <li>Golden light (sunrise / sunset)</li>
          </ul>
        </div>
      </div>

      <p className="fm-note">
        Open questions to decide on this canvas: (1) does “Cancel” go straight to
        this hub, or show a small “before you go…” prompt first? (2) are the SEO
        cards also shown on the front page (scroll), or only as the exit
        destination? (3) one shared page, or a section per card with its own URL
        (best for SEO)?
      </p>
    </main>
  );
}

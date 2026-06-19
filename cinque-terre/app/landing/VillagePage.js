"use client";

// A slim, elegant arrow that breathes with the loop script.
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

// The clean reading template (layer 1). Calm, minimal, generous whitespace —
// a title, a short lede, a couple of paragraphs, a few quiet facts, one
// Wikipedia link (desktop/tablet only), gentle prev/next between villages,
// and the shared footer: a primary action, "Read more" → the hub, and a
// quiet customer-service link.
export default function VillagePage({
  village,
  prevName,
  nextName,
  onPrev,
  onNext,
  onBoat,
  onReadMore,
  onService,
}) {
  return (
    <article className="village-page">
      <p className="vp-eyebrow">{village.eyebrow}</p>
      <h2 className="vp-title">{village.name}</h2>
      <p className="vp-lede">{village.lede}</p>

      {village.body.map((p, i) => (
        <p className="vp-body" key={i}>
          {p}
        </p>
      ))}

      <dl className="vp-facts">
        {village.facts.map((f) => (
          <div className="vp-fact" key={f.k}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </div>
        ))}
      </dl>

      <a
        className="wiki-link wiki-link--block"
        href={`https://en.wikipedia.org/wiki/${village.wiki}`}
        target="_blank"
        rel="noopener"
      >
        On Wikipedia ↗
      </a>

      <div className="vp-foot">
        <div className="vp-foot-row">
          <button type="button" className="vp-cta" onClick={onBoat}>
            Sail the Cinque Terre →
          </button>
          <button type="button" className="vp-read" onClick={onReadMore}>
            Read more <Arrow />
          </button>
        </div>
        <div className="vp-foot-cs">
          <button type="button" className="cs-link" onClick={onService}>
            Customer service ›
          </button>
        </div>
      </div>

      <nav className="vp-nav">
        <button type="button" onClick={onPrev}>
          ← {prevName}
        </button>
        <button type="button" onClick={onNext}>
          {nextName} →
        </button>
      </nav>
    </article>
  );
}

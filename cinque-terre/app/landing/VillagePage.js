"use client";

// The clean reading template (layer 1). Calm, minimal, generous whitespace —
// a title, a short lede, a couple of paragraphs, a few quiet facts, one
// Wikipedia link (desktop/tablet only), and gentle prev/next between villages.
export default function VillagePage({
  village,
  prevName,
  nextName,
  onPrev,
  onNext,
  onBoat,
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
        Read more on Wikipedia ↗
      </a>

      <div className="vp-foot">
        <button type="button" className="vp-cta" onClick={onBoat}>
          Sail the Cinque Terre →
        </button>
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

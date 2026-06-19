"use client";

import WoodSign from "./WoodSign";

const VILLAGES = [
  "Monterosso",
  "Vernazza",
  "Corniglia",
  "Manarola",
  "Riomaggiore",
];

// A caricature Cinque Terre trail signpost: a weathered post with the five
// village arrow-boards stacked on it. Each board opens that village's story.
export default function Signpost({ onSelect }) {
  return (
    <div className="signpost">
      <div className="signpost__post" aria-hidden="true" />
      <div className="signpost__boards">
        {VILLAGES.map((v, i) => (
          <button
            key={v}
            className="signpost__board"
            style={{ "--i": i }}
            onClick={() => onSelect(i)}
            aria-label={`${v} — read about the village`}
          >
            <WoodSign name={v} />
          </button>
        ))}
      </div>
    </div>
  );
}

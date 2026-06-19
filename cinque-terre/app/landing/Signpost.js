"use client";

import WoodSign from "./WoodSign";

// One small sign perched on each village along the skyline (x = % across,
// west → east). Clicking a sign opens that village's page.
const VILLAGES = [
  { name: "Monterosso", x: 9 },
  { name: "Vernazza", x: 30 },
  { name: "Corniglia", x: 50 },
  { name: "Manarola", x: 70 },
  { name: "Riomaggiore", x: 91 },
];

export default function Signpost({ onSelect }) {
  return (
    <div className="village-signs">
      {VILLAGES.map((v, i) => (
        <button
          key={v.name}
          className="village-sign"
          style={{ left: `${v.x}%` }}
          onClick={() => onSelect(i)}
          aria-label={`${v.name} — read about the village`}
        >
          <WoodSign name={v.name} />
        </button>
      ))}
    </div>
  );
}

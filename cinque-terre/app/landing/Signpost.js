"use client";

import WoodSign from "./WoodSign";

// One small sign perched on each village (x = % across the skyline, west →
// east). Each gets its own warm wood tone so the five look hand-cut, not
// stamped. Clicking a sign opens that village's page.
const VILLAGES = [
  { name: "Monterosso", x: 9, board: "#75502c", hi: "#8f6437", lo: "#46301a" },
  { name: "Vernazza", x: 30, board: "#6a4626", hi: "#86592f", lo: "#3f2a15" },
  { name: "Corniglia", x: 50, board: "#7c5631", hi: "#976a3b", lo: "#4a331c" },
  { name: "Manarola", x: 70, board: "#634126", hi: "#7e5430", lo: "#3a2613" },
  { name: "Riomaggiore", x: 91, board: "#704c2a", hi: "#8b6035", lo: "#432d18" },
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
          <WoodSign name={v.name} board={v.board} hi={v.hi} lo={v.lo} />
        </button>
      ))}
    </div>
  );
}

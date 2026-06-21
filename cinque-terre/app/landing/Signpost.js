"use client";

import WoodSign from "./WoodSign";

// One small sign perched on each village (x = % across the skyline, west →
// east). Each gets its own warm wood tone so the five look hand-cut. Monterosso
// — where the boat sails from and where you stand — gets a post down to the
// ground and a little "you are here" marker. Clicking a sign opens its page.
const VILLAGES = [
  { name: "Monterosso", x: 9, board: "#75502c", hi: "#8f6437", lo: "#46301a", here: true },
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
          className={"village-sign" + (v.here ? " village-sign--here" : "")}
          style={{ left: `${v.x}%` }}
          onClick={() => onSelect(i)}
          aria-label={`${v.name} — read about the village`}
        >
          <WoodSign name={v.name} board={v.board} hi={v.hi} lo={v.lo} />
          {v.here && (
            <>
              <svg className="vs-pin" viewBox="0 0 24 32" aria-hidden="true">
                <path
                  d="M12 1C6 1 2 5 2 11c0 7 10 20 10 20s10-13 10-20c0-6-4-10-10-10z"
                  fill="#f5f0e2"
                  stroke="#3a2412"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="11" r="3.4" fill="#3a2412" />
              </svg>
              <span className="vs-below" aria-hidden="true">
                <span className="vs-post" />
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

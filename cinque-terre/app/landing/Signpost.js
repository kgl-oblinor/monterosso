"use client";

import WoodSign from "./WoodSign";

// One small sign on a post at each village (x = % across the skyline, west →
// east). Each has its own distinct wood tone — all wood, but clearly different.
// Monterosso (where you stand / the boat sails from) is a touch larger and
// carries a "you are here" pin. Clicking a sign opens its page.
const VILLAGES = [
  { name: "Monterosso", x: 9, board: "#8a6233", hi: "#a87c46", lo: "#4f3416", here: true },
  { name: "Vernazza", x: 30, board: "#5e3c22", hi: "#7a5230", lo: "#33200f" },
  { name: "Corniglia", x: 50, board: "#8f6f43", hi: "#ad8a58", lo: "#5a4326" },
  { name: "Manarola", x: 70, board: "#6e3a26", hi: "#8c4f34", lo: "#3d2014" },
  { name: "Riomaggiore", x: 91, board: "#6a5640", hi: "#847055", lo: "#3e3122" },
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
          <WoodSign
            name={v.name}
            board={v.board}
            hi={v.hi}
            lo={v.lo}
            here={v.here}
          />
          <span className="vs-below" aria-hidden="true">
            <span className="vs-post" />
          </span>
        </button>
      ))}
    </div>
  );
}

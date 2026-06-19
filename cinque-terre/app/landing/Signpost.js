"use client";

import WoodSign from "./WoodSign";

// On the landing only Monterosso's sign is shown — that is where the boat
// sails from and where guests meet us. Clicking it opens Monterosso's page;
// the other four villages are reached from there. The line beneath names the
// meeting point: the Fishermen's Pier in the old harbour.
export default function Signpost({ onSelect }) {
  return (
    <div className="village-signs">
      <button
        className="village-sign"
        style={{ left: "13%" }}
        onClick={() => onSelect(0)}
        aria-label="Monterosso al Mare — find us at the main pier"
      >
        <WoodSign name="Monterosso" />
        <span className="village-sign__where">
          Find us · Molo dei Pescatori
        </span>
      </button>
    </div>
  );
}

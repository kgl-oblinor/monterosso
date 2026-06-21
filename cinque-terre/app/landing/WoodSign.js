"use client";

// A rustic, weathered wooden trail sign: an arrow board with the village name
// in white "carved" letters. The wood tone is passed in so each of the five
// signs reads a little differently — hand-cut, not stamped.
export default function WoodSign({
  name,
  board = "#6e4a2a",
  hi = "#8a5e34",
  lo = "#43291b",
  here = false,
}) {
  const id = name.toLowerCase();
  return (
    <svg viewBox="0 0 340 72" className="woodsign-svg" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`wood-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.5" stopColor={board} stopOpacity="0" />
          <stop offset="0.52" stopColor={board} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
      </defs>

      {/* arrow board */}
      <path
        d="M3 7 L300 7 L337 36 L300 65 L3 65 Z"
        fill={board}
        stroke="#3a2412"
        strokeWidth="1.5"
      />
      <path d="M3 7 L300 7 L337 36 L300 65 L3 65 Z" fill={`url(#wood-${id})`} opacity="0.6" />

      {/* a few weathered grain lines */}
      <path d="M10 20 Q150 16 320 22" fill="none" stroke="#2c1a0b" strokeWidth="0.8" opacity="0.35" />
      <path d="M10 36 Q150 33 318 37" fill="none" stroke={hi} strokeWidth="0.8" opacity="0.35" />
      <path d="M10 52 Q150 49 316 53" fill="none" stroke="#2c1a0b" strokeWidth="0.8" opacity="0.35" />

      {/* a couple of bolt heads */}
      <circle cx="300" cy="16" r="2" fill="#2c1a0b" opacity="0.5" />
      <circle cx="300" cy="56" r="2" fill="#2c1a0b" opacity="0.5" />

      {/* carved white name — dark engrave shadow behind, white on top */}
      <text
        x="166"
        y="45"
        textAnchor="middle"
        className="woodsign-text"
        fill="#1c0f06"
        opacity="0.5"
      >
        {name}
      </text>
      <text
        x="165"
        y="43.5"
        textAnchor="middle"
        className="woodsign-text"
        fill="#f3efe4"
      >
        {name}
      </text>

      {/* "you are here" pin, just after the name, aligned with the text */}
      {here && (
        <g transform="translate(248 21) scale(0.62)">
          <path
            d="M12 1C6 1 2 5 2 11c0 7 10 20 10 20s10-13 10-20c0-6-4-10-10-10z"
            fill="#f5f0e2"
            stroke="#23140a"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="11" r="3.4" fill="#23140a" />
        </g>
      )}
    </svg>
  );
}

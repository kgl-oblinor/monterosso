"use client";

// A rustic, weathered wooden trail sign (CAI style): a dark arrow board with
// the village name in white "carved" letters and the red-white-red blaze.
// Inspired by the Cinque Terre footpath signposts.
export default function WoodSign({ name }) {
  const id = name.toLowerCase();
  return (
    <svg viewBox="0 0 340 72" className="woodsign-svg" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`wood-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3a22" />
          <stop offset="0.5" stopColor="#42271480" stopOpacity="0" />
          <stop offset="0.52" stopColor="#3f2613" />
          <stop offset="1" stopColor="#2c1a0b" />
        </linearGradient>
      </defs>

      {/* arrow board */}
      <path
        d="M3 7 L300 7 L337 36 L300 65 L3 65 Z"
        fill="#3f2613"
        stroke="#23140a"
        strokeWidth="1.5"
      />
      <path d="M3 7 L300 7 L337 36 L300 65 L3 65 Z" fill={`url(#wood-${id})`} opacity="0.6" />

      {/* a few weathered grain lines */}
      <path d="M10 20 Q150 16 320 22" fill="none" stroke="#23140a" strokeWidth="0.8" opacity="0.4" />
      <path d="M10 36 Q150 33 318 37" fill="none" stroke="#6b4326" strokeWidth="0.8" opacity="0.3" />
      <path d="M10 52 Q150 49 316 53" fill="none" stroke="#23140a" strokeWidth="0.8" opacity="0.4" />

      {/* red-white-red CAI blaze */}
      <rect x="20" y="26" width="30" height="20" rx="1" fill="#c0392b" />
      <rect x="20" y="33" width="30" height="6" fill="#f1ece0" />

      {/* a couple of bolt heads */}
      <circle cx="280" cy="16" r="2" fill="#23140a" opacity="0.55" />
      <circle cx="280" cy="56" r="2" fill="#23140a" opacity="0.55" />

      {/* carved white name — dark engrave shadow behind, white on top */}
      <text
        x="186"
        y="45"
        textAnchor="middle"
        className="woodsign-text"
        fill="#1c0f06"
        opacity="0.5"
      >
        {name}
      </text>
      <text
        x="185"
        y="43.5"
        textAnchor="middle"
        className="woodsign-text"
        fill="#f3efe4"
      >
        {name}
      </text>
    </svg>
  );
}

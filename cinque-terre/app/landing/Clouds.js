// A subtle nod to flat-vector travel posters: stylised scalloped clouds
// drifting across the upper sky. Soft and few, so they never compete with
// the gold title or the villages. Barely visible at night (we have stars).
export default function Clouds() {
  return (
    <div className="clouds" aria-hidden="true">
      <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMin slice">
        <defs>
          {/* flatten each cloud's underside, like the poster's cumulus */}
          <clipPath id="cloudFlat">
            <rect x="-40" y="-80" width="420" height="120" />
          </clipPath>
          <g id="cloudBand" clipPath="url(#cloudFlat)">
            <ellipse cx="44" cy="40" rx="44" ry="24" />
            <ellipse cx="112" cy="40" rx="58" ry="32" />
            <ellipse cx="186" cy="40" rx="50" ry="28" />
            <ellipse cx="250" cy="40" rx="42" ry="23" />
            <ellipse cx="300" cy="40" rx="30" ry="17" />
          </g>
        </defs>
        <g fill="#ffffff">
          <use href="#cloudBand" transform="translate(80,58) scale(1.05)" opacity="0.82" />
          <use href="#cloudBand" transform="translate(1010,76) scale(0.85)" opacity="0.78" />
          <use href="#cloudBand" transform="translate(1240,44) scale(1.1)" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

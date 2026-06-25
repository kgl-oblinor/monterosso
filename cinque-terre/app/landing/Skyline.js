// The five villages of the Cinque Terre, drawn as stylised cliff-village
// silhouettes on the horizon (west → east): Monterosso · Vernazza ·
// Corniglia · Manarola · Riomaggiore — each in its own component file under
// ./villages, composed here inside the shared <svg>/<defs>.
import Monterosso from "./villages/Monterosso";
import Vernazza from "./villages/Vernazza";
import Corniglia from "./villages/Corniglia";
import Manarola from "./villages/Manarola";
import Riomaggiore from "./villages/Riomaggiore";

export default function Skyline() {
  return (
    <div className="skyline" aria-hidden="true">
      <svg viewBox="0 0 1440 416">
        <defs>
          <linearGradient id="mtnGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--veg-green)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--veg-green)" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="var(--hill-top)" />
            <stop offset="1" stopColor="var(--hill-bot)" />
          </linearGradient>
          <linearGradient id="rockGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="var(--rock-top)" />
            <stop offset="1" stopColor="var(--rock-bot)" />
          </linearGradient>
          <g id="cypress">
            <rect x="-1.3" y="-6" width="2.6" height="8" fill="#6a5436" />
            <path d="M0,-34 Q5,-20 4.2,-5 Q0,0 -4.2,-5 Q-5,-20 0,-34 Z" fill="var(--cypress)" />
            <path d="M0,-32 Q2.6,-19 1.4,-6 L0,-5 Z" fill="var(--cypress-hi)" />
          </g>
          <g id="bush">
            <ellipse cx="0" cy="0" rx="9" ry="6.5" fill="var(--bush)" />
            <ellipse cx="-2.5" cy="-1.6" rx="4.5" ry="3.4" fill="var(--bush-hi)" />
          </g>
        </defs>

        <g transform="translate(0,416) scale(1,1.6) translate(0,-260)">
          <Monterosso />
          <Vernazza />
          <Corniglia />
          <Manarola />
          <Riomaggiore />
        </g>
      </svg>
    </div>
  );
}

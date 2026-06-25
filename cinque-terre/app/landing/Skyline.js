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
          <linearGradient id="farHills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b8c9af" />
            <stop offset="1" stopColor="#94ac8c" />
          </linearGradient>
          <linearGradient id="farHillsNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a3bb98" />
            <stop offset="1" stopColor="#7e9a75" />
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
          {/* Distant green hills / meadows on the horizon — two hazy rolling
              ridges behind every village, no houses, just soft silhouettes. */}
          <path
            d="M-60,260 L-60,222 Q90,206 240,216 Q400,228 560,212 Q720,200 880,214 Q1040,226 1200,210 Q1360,200 1500,214 L1500,260 Z"
            fill="url(#farHills)"
          />
          <path
            d="M-60,260 L-60,234 Q120,220 300,228 Q470,236 650,222 Q820,210 1000,224 Q1180,236 1360,222 Q1440,216 1500,224 L1500,260 Z"
            fill="url(#farHillsNear)"
          />
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

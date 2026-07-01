// Monterosso icon set — bespoke, nautical, duotone.
//
// One cohesive family for the whole signed-in app (icon rail, admin rail, dialogs).
// Two-tone technique: every "object" mark carries a soft body wash (currentColor at low
// opacity) under a crisp 1.75-weight stroke. Because both layers use `currentColor`, the
// existing colour conventions just work — `text-ink-muted` renders a calm graphite mark,
// and the selected `text-gold` state fills the body with a soft gold wash under a gold
// stroke, so the active nav item reads clearly and warmly (per DESIGN-HIG: gold as a
// restrained accent, ink on white).
//
// Pure UI chrome (menu, close, arrows, share, download) stays stroke-only in the *same*
// weight and round caps — the way SF Symbols keeps object symbols richer than plumbing
// glyphs. That's the cohesion rule: shared weight + corner radius everywhere; body wash
// reserved for the nautical marks.
import type { ReactElement, SVGProps } from "react";

/** Drop-in type for a Monterosso icon component (replaces the old `LucideIcon` type). */
export type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

/** Soft body fill shared by every duotone mark. */
const wash = { fill: "currentColor", fillOpacity: 0.16, stroke: "none" } as const;
/** Small solid detail (dots, badges). */
const dot = { fill: "currentColor", stroke: "none" } as const;

function Svg({ children, ...props }: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ── Nautical nav marks ─────────────────────────────────────────────── */

/** Home / home port. */
export const Anchor: IconComponent = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="5" r="2" {...wash} />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v12.6" />
    <path d="M8.5 9.5h7" />
    <path d="M4.5 13.5a7.5 7.5 0 0 0 15 0" />
    <path d="M4.5 13.5 2.9 13.1M4.5 13.5 5.7 15" />
    <path d="M19.5 13.5 21.1 13.1M19.5 13.5 18.3 15" />
  </Svg>
);

/** Chat / conversations — a bubble with a little sea swell inside. */
export const Message: IconComponent = (props) => (
  <Svg {...props}>
    <path
      {...wash}
      d="M6 5.5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6l-3.2 3v-3H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
    />
    <path d="M6 5.5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6l-3.2 3v-3H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
    <path d="M8.4 10.6c.9-1.15 1.85-1.15 2.8 0s1.9 1.15 2.8 0" />
  </Svg>
);

/** Trips / departures — a compass rose. */
export const Compass: IconComponent = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" {...wash} />
    <circle cx="12" cy="12" r="8.5" />
    <path {...wash} d="M15.6 8.4 13 13l-4.6 2.6L11 11Z" />
    <path d="M15.6 8.4 13 13l-4.6 2.6L11 11Z" />
    <circle cx="12" cy="12" r=".85" {...dot} />
  </Svg>
);

/** Skipper's public site — a sailboat under way. */
export const Sail: IconComponent = (props) => (
  <Svg {...props}>
    <path {...wash} d="M12 3.5c3.6 1.5 5.8 5.2 6.2 10H12z" />
    <path d="M12 3.5c3.6 1.5 5.8 5.2 6.2 10H12z" />
    <path d="M12 4v9.5" />
    <path {...wash} d="M4 16h16l-1.9 3.4a2 2 0 0 1-1.7 1H7.6a2 2 0 0 1-1.7-1Z" />
    <path d="M4 16h16l-1.9 3.4a2 2 0 0 1-1.7 1H7.6a2 2 0 0 1-1.7-1Z" />
  </Svg>
);

/* ── Rail chrome ────────────────────────────────────────────────────── */

/** Expand the rail — panel with the divider drawn back, chevron opening right. */
export const PanelOpen: IconComponent = (props) => (
  <Svg {...props}>
    <path {...wash} d="M3.5 7a2.5 2.5 0 0 1 2.5-2.5H9v15H6A2.5 2.5 0 0 1 3.5 17Z" />
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M9 4.5v15" />
    <path d="m13 9.5 2.5 2.5-2.5 2.5" />
  </Svg>
);

/** Collapse the rail — same panel, chevron closing left. */
export const PanelClose: IconComponent = (props) => (
  <Svg {...props}>
    <path {...wash} d="M3.5 7a2.5 2.5 0 0 1 2.5-2.5H9v15H6A2.5 2.5 0 0 1 3.5 17Z" />
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M9 4.5v15" />
    <path d="M15.5 9.5 13 12l2.5 2.5" />
  </Svg>
);

/** Get the app — a phone. */
export const Phone: IconComponent = (props) => (
  <Svg {...props}>
    <rect x="6.5" y="3" width="11" height="18" rx="2.6" {...wash} />
    <rect x="6.5" y="3" width="11" height="18" rx="2.6" />
    <path d="M10.5 5.4h3" />
    <circle cx="12" cy="18.3" r=".7" {...dot} />
  </Svg>
);

/* ── Admin marks ────────────────────────────────────────────────────── */

/** Awaiting approval — an hourglass. */
export const Hourglass: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M7 3.5h10M7 20.5h10" />
    <path d="M8 3.5 12 12 8 20.5" />
    <path d="M16 3.5 12 12l4 8.5" />
    <path {...wash} d="M9.5 6h5L12 9.5z" />
    <path {...wash} d="M9.5 18h5L12 14.5z" />
  </Svg>
);

/** Skippers — a ship with a pennant. */
export const Ship: IconComponent = (props) => (
  <Svg {...props}>
    <path {...wash} d="M4.5 15.5h15l-1.7 3.4a2 2 0 0 1-1.8 1.1H8a2 2 0 0 1-1.8-1.1Z" />
    <path d="M4.5 15.5h15l-1.7 3.4a2 2 0 0 1-1.8 1.1H8a2 2 0 0 1-1.8-1.1Z" />
    <path {...wash} d="M9 15.5v-4h6v4z" />
    <path d="M9 15.5v-4h6v4" />
    <path d="M12 11.5V7" />
    <path {...wash} d="M12 7.2l3.2 1.1L12 9.4z" />
    <path d="M12 7.2l3.2 1.1L12 9.4z" />
  </Svg>
);

/** Profile / account — a single figure. */
export const Profile: IconComponent = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="3.4" {...wash} />
    <circle cx="12" cy="8" r="3.4" />
    <path {...wash} d="M5.5 19.5a6.5 6.5 0 0 1 13 0z" />
    <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
  </Svg>
);

/** Customers — two figures. */
export const Users: IconComponent = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="8.5" r="3" {...wash} />
    <circle cx="10" cy="8.5" r="3" />
    <path {...wash} d="M4.5 19a5.5 5.5 0 0 1 11 0z" />
    <path d="M4.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a2.6 2.6 0 0 1 0 5" />
    <path d="M17 14.2a5 5 0 0 1 2.9 4.8" />
  </Svg>
);

/** Sitemap — a grid of pages. */
export const Grid: IconComponent = (props) => (
  <Svg {...props}>
    <rect x="4" y="4" width="7" height="7" rx="1.6" {...wash} />
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </Svg>
);

/** Sign out — through the doorway. */
export const LogOut: IconComponent = (props) => (
  <Svg {...props}>
    <path {...wash} d="M13 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H13z" />
    <path d="M13 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H13" />
    <path d="M17.5 12H9.5" />
    <path d="M14.5 8.5 18 12l-3.5 3.5" />
  </Svg>
);

/* ── UI glyphs (stroke-only chrome, same weight) ────────────────────── */

/** Hamburger menu. */
export const Menu: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

/** Close / dismiss. */
export const Close: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
  </Svg>
);

/** iOS share (used in the Get-the-app steps). */
export const Share: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M12 14.5V4" />
    <path d="M8.5 7.3 12 3.8l3.5 3.5" />
    <path d="M7.5 10.5H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5" />
  </Svg>
);

/** Add to Home Screen — a soft square with a plus. */
export const PlusSquare: IconComponent = (props) => (
  <Svg {...props}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" {...wash} />
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </Svg>
);

/** Install / download. */
export const Download: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M12 4v10.5" />
    <path d="M8.5 11 12 14.5 15.5 11" />
    <path d="M5 18.5h14" />
  </Svg>
);

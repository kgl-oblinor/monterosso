// Next.js App Router sitemap (app/sitemap.js → /sitemap.xml).
// Lists the home page and every (content)/SEO page. The /news track is
// reserved in the plan but not yet built, so it is intentionally omitted
// until those pages exist (we never list URLs that would 404).

import { DEFAULT_SKIPPER } from "../lib/skippers";

const base = "https://monterosso-cinque-terre.kgl-56a.workers.dev";

export default function sitemap() {
  const now = new Date();

  const routes = [
    { path: "/", priority: 1.0 },
    { path: "/guide", priority: 0.9 },
    { path: "/monterosso", priority: 0.9 },
    { path: "/cinque-terre-by-boat", priority: 0.8 },
    { path: "/monterosso/beaches", priority: 0.7 },
    { path: "/monterosso/restaurants", priority: 0.7 },
    { path: "/cinque-terre/vernazza", priority: 0.6 },
    { path: "/cinque-terre/corniglia", priority: 0.6 },
    { path: "/cinque-terre/manarola", priority: 0.6 },
    { path: "/cinque-terre/riomaggiore", priority: 0.6 },
    // Skipper public landings (/s/[slug]). Only the pilot exists today; the SKIPPERS
    // registry in lib/skippers.js isn't exported, so we list the DEFAULT_SKIPPER. When
    // more skippers go live this should map over the live skipper list instead.
    { path: `/s/${DEFAULT_SKIPPER}`, priority: 0.7 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
  }));
}

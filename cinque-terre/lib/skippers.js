// ============================================================
// Config-driven skipper landing — data source.
//
// A skipper's PUBLIC page is rendered ENTIRELY from a config object below. Drop in
// a new object with a different slug and you get a different, coherent landing page
// with ZERO code changes (the "generalized-tour.js" idea).
//
// The chosen `theme.id` + `theme.dayNight` are the SAME ten themes the skipper picks
// in baatchat's "Min side" editor (see baatchat/web .../api/site.ts THEME_PREVIEWS).
// The editor holds a preview swatch per theme; the FULL day/night palettes live here.
//
// ---- HONEST DATA-SOURCE NOTE (the D1 seam) --------------------------------
// Right now this file IS the source of truth: a static, hand-seeded config. The
// baatchat "Min side" editor persists a skipper's live edits to a *localStorage mock*
// (realSiteApi is NOT_IMPLEMENTED — no D1 yet). So edits made in the dashboard do NOT
// reach this page yet. This is a faithful, beautiful demo of Andrea's config — not a
// live mirror of his dashboard. To close the wow-loop, see getSkipper() below.
// ============================================================

// ---- The ten curated themes: day + night palettes -------------------------
// Each palette is a coherent, tasteful set (background treatment + accent + text tone).
// Dark themes/variants use a translucent `surface` so cards read as glass over the bg.
export const THEMES = {
  linen: {
    day: { bg: "#fbfaf7", surface: "#ffffff", ink: "#1c1b19", muted: "#6b6862", accent: "#b08d57", onAccent: "#ffffff", line: "rgba(0,0,0,0.09)" },
    night: { bg: "#141410", surface: "rgba(255,255,255,0.05)", ink: "#f2efe8", muted: "#a8a49a", accent: "#cdae74", onAccent: "#141410", line: "rgba(255,255,255,0.11)" },
  },
  sand: {
    day: { bg: "linear-gradient(180deg,#f6efe0,#efe2cc)", surface: "#fbf5ea", ink: "#2f2a20", muted: "#7a6f5c", accent: "#c08a4a", onAccent: "#ffffff", line: "rgba(60,45,20,0.13)" },
    night: { bg: "linear-gradient(180deg,#221c14,#17130d)", surface: "rgba(255,244,224,0.06)", ink: "#efe6d4", muted: "#b3a487", accent: "#d69f5e", onAccent: "#201b13", line: "rgba(255,240,210,0.11)" },
  },
  deepsea: {
    day: { bg: "linear-gradient(180deg,#123152,#08192b)", surface: "rgba(255,255,255,0.06)", ink: "#eaf1f7", muted: "#a4b7c8", accent: "#ead27e", onAccent: "#07182a", line: "rgba(255,255,255,0.13)" },
    night: { bg: "linear-gradient(180deg,#08182a,#020913)", surface: "rgba(255,255,255,0.05)", ink: "#dfe8f0", muted: "#8ba0b3", accent: "#d7c079", onAccent: "#05101c", line: "rgba(255,255,255,0.10)" },
  },
  goldenhour: {
    day: { bg: "linear-gradient(180deg,#f8dcac,#eea765)", surface: "#fff6ea", ink: "#3a2416", muted: "#8a6a4e", accent: "#c85a2b", onAccent: "#ffffff", line: "rgba(90,50,20,0.16)" },
    night: { bg: "linear-gradient(180deg,#3a1f2e,#1a1220)", surface: "rgba(255,255,255,0.06)", ink: "#f4e6d8", muted: "#c39f8f", accent: "#f0a15c", onAccent: "#241017", line: "rgba(255,220,190,0.13)" },
  },
  terracotta: {
    day: { bg: "linear-gradient(180deg,#ecd0ba,#dcae92)", surface: "#f7e9dd", ink: "#3d2419", muted: "#85604e", accent: "#a8492e", onAccent: "#ffffff", line: "rgba(80,40,25,0.15)" },
    night: { bg: "linear-gradient(180deg,#251611,#170d0a)", surface: "rgba(255,232,220,0.06)", ink: "#f0dccf", muted: "#b8917d", accent: "#c85f3c", onAccent: "#241511", line: "rgba(255,210,190,0.11)" },
  },
  slate: {
    day: { bg: "linear-gradient(180deg,#eceff3,#d8dee5)", surface: "#fbfcfd", ink: "#202730", muted: "#63707e", accent: "#4a6274", onAccent: "#ffffff", line: "rgba(30,45,60,0.13)" },
    night: { bg: "linear-gradient(180deg,#141a20,#0c1015)", surface: "rgba(255,255,255,0.05)", ink: "#e6ecf1", muted: "#93a3b2", accent: "#8fa9bd", onAccent: "#12171d", line: "rgba(255,255,255,0.10)" },
  },
  riviera: {
    day: { bg: "linear-gradient(180deg,#f8f2dd,#eee9ca)", surface: "#fffdf4", ink: "#23303a", muted: "#6b7580", accent: "#1f7a8c", onAccent: "#ffffff", line: "rgba(30,60,70,0.13)" },
    night: { bg: "linear-gradient(180deg,#102120,#0a1615)", surface: "rgba(220,255,250,0.05)", ink: "#eef4ec", muted: "#97b0ab", accent: "#47b0bd", onAccent: "#0c1a19", line: "rgba(220,255,250,0.11)" },
  },
  coral: {
    day: { bg: "linear-gradient(180deg,#fde7e0,#f8cfc3)", surface: "#fff6f2", ink: "#3a201c", muted: "#8a655d", accent: "#e0674f", onAccent: "#ffffff", line: "rgba(120,60,50,0.13)" },
    night: { bg: "linear-gradient(180deg,#251413,#160c0b)", surface: "rgba(255,200,190,0.06)", ink: "#f4ddd6", muted: "#c0968c", accent: "#f07a5e", onAccent: "#241413", line: "rgba(255,200,190,0.11)" },
  },
  editorial: {
    day: { bg: "#f4f3f1", surface: "#ffffff", ink: "#0d0d0d", muted: "#6a6a6a", accent: "#0d0d0d", onAccent: "#ffffff", line: "rgba(0,0,0,0.13)" },
    night: { bg: "#0c0c0c", surface: "rgba(255,255,255,0.045)", ink: "#f4f3f1", muted: "#9a9a9a", accent: "#f4f3f1", onAccent: "#0c0c0c", line: "rgba(255,255,255,0.15)" },
  },
  notte: {
    day: { bg: "linear-gradient(180deg,#101827,#080b12)", surface: "rgba(255,255,255,0.05)", ink: "#e8ecf2", muted: "#9098a6", accent: "#b9c4d6", onAccent: "#0e1420", line: "rgba(255,255,255,0.10)" },
    night: { bg: "linear-gradient(180deg,#070a11,#020409)", surface: "rgba(255,255,255,0.04)", ink: "#dfe4ec", muted: "#808896", accent: "#aab6c8", onAccent: "#05070c", line: "rgba(255,255,255,0.08)" },
  },
};

/** Resolve a palette from a theme config + a boolean (night?). Falls back to a safe theme. */
export function resolvePalette(theme, isNight) {
  const t = THEMES[theme?.id] ?? THEMES.deepsea;
  return isNight ? t.night : t.day;
}

// ---- Skipper registry ------------------------------------------------------
// Keyed by slug. Andrea Berio is the live pilot instance (see ANDREA-DATA.md for the
// sourcing of every field). Everything the landing shows comes from here.
const SKIPPERS = {
  andrea: {
    slug: "andrea",
    listingTitle: "Tiburon Boat Services",
    tagline: "The Cinque Terre, seen from the water.",
    intro:
      "A private tour of the five villages aboard the Paolona — a traditional Ligurian gozzo out of Monterosso, with a captain who is yours alone.",
    location: "Monterosso al Mare · Cinque Terre",
    meetingPoint: "Molo dei Pescatori, Monterosso al Mare",
    captain: "Andrea",
    coCaptain: "Davide",
    boatName: "Paolona",
    boatType: "traditional Ligurian gozzo",
    since: 2014,
    currency: "€",
    maxGuests: 6,
    // Base per-guest figure (config value). Each tour carries its own price below.
    pricePerGuest: 100,
    tours: [
      {
        key: "coastal2h",
        name: "Coastal tour",
        duration: "2 hours",
        price: 90,
        description:
          "All five villages from the water, a cold drink in hand, and a local who tells the stories the ferries never stop for.",
      },
      {
        key: "swim3h",
        name: "Swim-stop tour",
        duration: "3 hours",
        price: 110,
        description:
          "The whole coast with an hour to swim in the protected coves — Guvano beach and a hidden bay just before Manarola.",
      },
      {
        key: "sunset",
        name: "Sunset tour",
        duration: "3 hours",
        price: 130,
        description:
          "Golden hour along the cliffs, a swim in two quiet coves, and the sun going down behind the point — focaccia and wine aboard.",
      },
    ],
    // Andrea's real, publicly listed contact (verified — ANDREA-DATA.md). Note this is
    // the SKIPPER's own number in his config, NOT the placeholder in lib/tour.js.
    whatsapp: "393406221381",
    phone: "+39 340 6221381",
    social: {
      instagram: "https://www.instagram.com/tiburonboatservices/",
      tripadvisorRating: 4.8,
      tripadvisorReviews: 216,
    },
    // The chosen appearance — one of the ten shared themes + day/night mode.
    theme: { id: "deepsea", dayNight: "auto" },
  },
};

/**
 * Load a skipper's config by slug.
 *
 * ---- THE D1 SEAM (wire live edits here) -----------------------------------
 * Today this returns the STATIC config above, so the page shows Andrea's seeded
 * config — a working, honest demo, but NOT his live dashboard edits.
 *
 * To make the landing reflect what the skipper saves in baatchat "Min side":
 *   1. In baatchat, implement realSiteApi (api/site.ts) to PUT the SiteSettings
 *      (+ theme {id,dayNight}) into a D1 table, e.g.  skipper_sites(slug, config JSON).
 *   2. Here, replace the SKIPPERS[slug] lookup with a D1 read via the Worker binding:
 *
 *        import { getCloudflareContext } from "@opennextjs/cloudflare";
 *        const { env } = getCloudflareContext();
 *        const row = await env.DB
 *          .prepare("SELECT config FROM skipper_sites WHERE slug = ?")
 *          .bind(slug).first();
 *        return row ? JSON.parse(row.config) : SKIPPERS[slug] ?? null;
 *
 *      (Add the `skipper_sites` table + binding — the app already binds D1 as `DB`
 *       in wrangler.jsonc for the events table.)
 * Until step 1+2 land, this stays a faithful render of the static config — no faking.
 */
// baatchat's public read endpoint. baatchat OWNS the skipper site config (in its own D1,
// monterosso_chat); this landing FETCHES it over HTTP — the two apps use DIFFERENT D1 dbs.
// Same base URL the booking flow uses (app/landing/Landing.js CHAT_API_BASE).
const CHAT_API_BASE = "https://monterosso-chat.kgl-56a.workers.dev";

/**
 * Load a skipper's config by slug — LIVE from baatchat, with a static fallback.
 *
 * The stored config baatchat serves is already the exact shape SkipperLanding.js renders
 * (see migration 0004 / the "Min side" editor), so the response is used as-is. On any
 * fetch failure/timeout we fall back to the static SKIPPERS config so the page never breaks;
 * we only return null (→ notFound()) when the slug is unknown both remotely AND locally.
 *
 * This route is force-dynamic (see app/s/[slug]/page.js), so every request reflects the
 * skipper's latest saved edits.
 */
export async function getSkipper(slug) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // don't let a slow API hang the page
    const res = await fetch(`${CHAT_API_BASE}/public/sites/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (res.ok) {
      const config = await res.json();
      if (config && config.listingTitle) return config;
    }
    // Non-OK (e.g. 404 unknown remotely) → fall through to the static registry below.
  } catch {
    // Network error / timeout / abort → fall back to the static config so the page holds.
  }
  return SKIPPERS[slug] ?? null;
}

export const DEFAULT_SKIPPER = "andrea";

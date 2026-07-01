// Skipper "Min side" site config — persistence for the config-driven public landing.
//
// baatchat OWNS each skipper's landing config (stored as JSON in D1 `skipper_sites`, in the
// monterosso_chat database / binding DB). The cinque-terre landing (/s/<slug>) FETCHES it
// over HTTP via the public read endpoint. The stored config is the FULL landing config
// object (the shape SkipperLanding.js renders) plus the editor-only `departures` +
// `blogPosts`; the dashboard merges its editable fields into the whole object and PUTs it
// back, so non-editable fields (intro, tours, captain, social, …) are preserved.

import type { Env } from "./index";

// A stored config is opaque JSON to the Worker — the web owns the merge, we just persist and
// serve it. Typed loosely so we never drop unknown fields.
type SiteConfig = Record<string, unknown>;

// A sensible default for a skipper who has never saved (no row yet). Only a safety net —
// the pilot skipper (Andrea, id 1) is seeded by migration 0004. Editable fields empty,
// theme + collections defaulted, slug derived so a first PUT has a stable public slug.
function defaultConfig(skipperId: number): SiteConfig {
  return {
    slug: `skipper-${skipperId}`,
    listingTitle: "",
    tagline: "",
    pricePerGuest: 0,
    maxGuests: 0,
    departures: [],
    theme: { id: "deepsea", dayNight: "auto" },
    blogPosts: [],
  };
}

// GET /chat/me/site — the authed skipper's stored config (parsed), or a default if none.
export async function getMySite(env: Env, skipperId: number): Promise<SiteConfig> {
  const row = await env.DB.prepare(
    `SELECT config FROM skipper_sites WHERE skipper_id = ? LIMIT 1`
  )
    .bind(skipperId)
    .first<{ config: string }>();
  if (!row) return defaultConfig(skipperId);
  try {
    return JSON.parse(row.config) as SiteConfig;
  } catch {
    return defaultConfig(skipperId);
  }
}

// PUT /chat/me/site — UPSERT the posted full config for the authed skipper only. The slug is
// stable: taken from the config on first insert (or derived), and NOT overwritten on update.
export async function saveMySite(env: Env, skipperId: number, config: SiteConfig): Promise<SiteConfig> {
  const slug =
    typeof config.slug === "string" && config.slug.trim() ? config.slug.trim() : `skipper-${skipperId}`;
  const json = JSON.stringify(config);
  await env.DB.prepare(
    `INSERT INTO skipper_sites (skipper_id, slug, config, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(skipper_id) DO UPDATE SET
       config = excluded.config, updated_at = excluded.updated_at`
  )
    .bind(skipperId, slug, json)
    .run();
  return config;
}

// GET /public/sites/:slug — the public config for a slug, or null if unknown.
export async function getPublicSite(env: Env, slug: string): Promise<SiteConfig | null> {
  const row = await env.DB.prepare(
    `SELECT config FROM skipper_sites WHERE slug = ? LIMIT 1`
  )
    .bind(slug)
    .first<{ config: string }>();
  if (!row) return null;
  try {
    return JSON.parse(row.config) as SiteConfig;
  } catch {
    return null;
  }
}

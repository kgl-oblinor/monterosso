// The skipper's own landing-page control panel ("Min side"). The dashboard edits these
// settings; the public landing reads them (that cross-app wiring is handled separately).
//
// Swappable like authApi/adminApi: `siteApi = env.useMocks ? mockSiteApi : realSiteApi`.
// The real impl is a thin stub for now — the demo runs on the mock, which persists to
// localStorage so edits survive a refresh.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { env } from "@/lib/env";
import type { TranslationKey } from "@/i18n";
import { mockSiteApi } from "@/mocks/mockSite";

// --- data model -------------------------------------------------------------

/** One scheduled departure the skipper offers, e.g. { key: "sunrise", label: "Soloppgang", time: "06:00" }. */
export interface Departure {
  key: string;
  label: string;
  time: string; // "HH:MM"
}

/** The ten curated landing themes a skipper can pick from. Each `id` maps to a coherent,
 *  tasteful palette (background treatment + accent + text tone) held by the public landing.
 *  The editor only needs a preview swatch per theme — see THEME_PREVIEWS below. */
export type ThemeId =
  | "linen" // minimal white
  | "sand" // warm sand
  | "deepsea" // deep sea / navy
  | "goldenhour" // sunset / golden hour
  | "terracotta" // coastal terracotta
  | "slate" // cool slate
  | "riviera" // lemon / Riviera azure
  | "coral" // soft coral
  | "editorial" // editorial mono
  | "notte"; // night

/** How the public page resolves its palette: pinned to day, pinned to night, or `auto`
 *  (switch by the *viewer's* local time). */
export type DayNightMode = "day" | "night" | "auto";

export interface Theme {
  id: ThemeId;
  dayNight: DayNightMode;
}

/** Editor-side preview for each theme — just enough colour to render a tasteful swatch
 *  gallery in "Min side". The full day/night palettes live with the public landing
 *  (cinque-terre/lib/skippers.js), so the two stay in sync by shared `ThemeId`. */
export const THEME_PREVIEWS: {
  id: ThemeId;
  nameKey: TranslationKey;
  bg: string; // swatch background (may be a gradient)
  accent: string;
  ink: string; // a legibility dot on the swatch
}[] = [
  { id: "linen", nameKey: "site.theme.linen", bg: "#fbfaf7", accent: "#b08d57", ink: "#1c1b19" },
  { id: "sand", nameKey: "site.theme.sand", bg: "linear-gradient(135deg,#f3e9d8,#e7d6ba)", accent: "#c08a4a", ink: "#2f2a20" },
  { id: "deepsea", nameKey: "site.theme.deepsea", bg: "linear-gradient(135deg,#0f2740,#07182a)", accent: "#ead27e", ink: "#eaf1f7" },
  { id: "goldenhour", nameKey: "site.theme.goldenhour", bg: "linear-gradient(135deg,#f6d9a8,#e9a15c)", accent: "#c85a2b", ink: "#3a2416" },
  { id: "terracotta", nameKey: "site.theme.terracotta", bg: "linear-gradient(135deg,#e7c8b0,#d3a488)", accent: "#a8492e", ink: "#3d2419" },
  { id: "slate", nameKey: "site.theme.slate", bg: "linear-gradient(135deg,#e7ebef,#d3dae1)", accent: "#4a6274", ink: "#202730" },
  { id: "riviera", nameKey: "site.theme.riviera", bg: "linear-gradient(135deg,#f6f0d8,#eae6c6)", accent: "#1f7a8c", ink: "#23303a" },
  { id: "coral", nameKey: "site.theme.coral", bg: "linear-gradient(135deg,#fce4dd,#f6cabf)", accent: "#e0674f", ink: "#3a201c" },
  { id: "editorial", nameKey: "site.theme.editorial", bg: "#f4f3f1", accent: "#0d0d0d", ink: "#0d0d0d" },
  { id: "notte", nameKey: "site.theme.notte", bg: "linear-gradient(135deg,#0e1420,#05070c)", accent: "#aab6c8", ink: "#e8ecf2" },
];

export interface BlogPost {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string; // ISO
}

/** Everything a skipper controls on their public landing page. */
export interface SiteSettings {
  listingTitle: string;
  tagline: string;
  pricePerGuest: number; // EUR
  maxGuests: number;
  departures: Departure[];
  theme: Theme;
  blogPosts: BlogPost[];
}

/** A partial update to the settings (any subset of the editable fields). `blogPosts` is
 *  patchable too so the publish toggle can persist without a dedicated endpoint. */
export type SiteSettingsPatch = Partial<SiteSettings>;

/** A new blog post before it has an id/createdAt (assigned by the API). */
export interface NewBlogPost {
  title: string;
  body: string;
  published: boolean;
}

// --- API contract -----------------------------------------------------------

export interface SiteApi {
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(patch: SiteSettingsPatch): Promise<SiteSettings>;
  addBlogPost(post: NewBlogPost): Promise<SiteSettings>;
  deleteBlogPost(id: string): Promise<SiteSettings>;
}

// Real backend not built yet — the section runs on the mock in the demo. When the
// endpoints ship, fill these in (e.g. GET/PUT /site, POST/DELETE /site/blog) with zero UI changes.
const NOT_IMPLEMENTED = "Site settings backend not implemented yet — running on mocks.";
const realSiteApi: SiteApi = {
  async getSiteSettings() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async updateSiteSettings() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async addBlogPost() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async deleteBlogPost() {
    throw new Error(NOT_IMPLEMENTED);
  },
};

export const siteApi: SiteApi = env.useMocks ? mockSiteApi : realSiteApi;

// --- react-query hooks ------------------------------------------------------

const SITE_KEY = ["siteSettings"] as const;

export function useSiteSettings() {
  return useQuery({
    queryKey: SITE_KEY,
    queryFn: () => siteApi.getSiteSettings(),
    staleTime: 60_000,
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: SiteSettingsPatch) => siteApi.updateSiteSettings(patch),
    onSuccess: (settings) => qc.setQueryData(SITE_KEY, settings),
  });
}

export function useAddBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: NewBlogPost) => siteApi.addBlogPost(post),
    onSuccess: (settings) => qc.setQueryData(SITE_KEY, settings),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => siteApi.deleteBlogPost(id),
    onSuccess: (settings) => qc.setQueryData(SITE_KEY, settings),
  });
}

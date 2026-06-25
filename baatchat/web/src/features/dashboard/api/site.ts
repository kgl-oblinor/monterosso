// The skipper's own landing-page control panel ("Min side"). The dashboard edits these
// settings; the public landing reads them (that cross-app wiring is handled separately).
//
// Swappable like authApi/adminApi: `siteApi = env.useMocks ? mockSiteApi : realSiteApi`.
// The real impl is a thin stub for now — the demo runs on the mock, which persists to
// localStorage so edits survive a refresh.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { env } from "@/lib/env";
import { mockSiteApi } from "@/mocks/mockSite";

// --- data model -------------------------------------------------------------

/** One scheduled departure the skipper offers, e.g. { key: "sunrise", label: "Soloppgang", time: "06:00" }. */
export interface Departure {
  key: string;
  label: string;
  time: string; // "HH:MM"
}

/** The four landing backgrounds a skipper can pick from. */
export type ThemeBackground = "bay" | "deepblue" | "villages" | "scene";

export interface Theme {
  background: ThemeBackground;
  accent: string; // hex, e.g. "#ead27e"
}

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

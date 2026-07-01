// In-memory mock of the skipper's "Min side" settings, seeded with sensible
// Monterosso/Paolona defaults. Edits persist to localStorage so they survive a
// refresh within the demo. Same shape as the real SiteApi so callers don't care.
import type {
  NewBlogPost,
  SiteApi,
  SiteSettings,
  SiteSettingsPatch,
} from "@/features/dashboard/api/site";
import { delay } from "./fixtures";

const STORAGE_KEY = "baatchat.mock.siteSettings";

// Seeded with the pilot skipper's real details — Andrea Berio, "Tiburon Boat Services",
// the gozzo Paolona out of Monterosso al Mare (see ANDREA-DATA.md for the sourcing).
const DEFAULTS: SiteSettings = {
  listingTitle: "Tiburon Boat Services",
  tagline: "The Cinque Terre, seen from the water.",
  pricePerGuest: 100,
  maxGuests: 6,
  departures: [
    { key: "coastal2h", label: "Coastal · 2 hours", time: "10:00" },
    { key: "swim3h", label: "Swim stop · 3 hours", time: "14:00" },
    { key: "sunset", label: "Sunset", time: "18:30" },
  ],
  theme: { id: "deepsea", dayNight: "auto" },
  blogPosts: [
    {
      id: "b1",
      title: "Welcome aboard the Paolona",
      body: "Davide and I take you the whole coast — from Molo dei Pescatori past all five villages, into the quiet coves the ferries never reach.",
      published: true,
      createdAt: "2026-06-01T08:00:00.000Z",
    },
  ],
};

function load(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SiteSettings;
  } catch {
    // ignore corrupt/blocked storage — fall back to defaults
  }
  return structuredClone(DEFAULTS);
}

let settings: SiteSettings = load();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable — in-memory state still works for the session
  }
}

export const mockSiteApi: SiteApi = {
  async getSiteSettings() {
    await delay(300);
    return structuredClone(settings);
  },

  async updateSiteSettings(patch: SiteSettingsPatch) {
    await delay(250);
    settings = { ...settings, ...patch };
    persist();
    return structuredClone(settings);
  },

  async addBlogPost(post: NewBlogPost) {
    await delay(250);
    const created = {
      id: `b${Date.now()}`,
      title: post.title,
      body: post.body,
      published: post.published,
      createdAt: new Date().toISOString(),
    };
    settings = { ...settings, blogPosts: [created, ...settings.blogPosts] };
    persist();
    return structuredClone(settings);
  },

  async deleteBlogPost(id: string) {
    await delay(250);
    settings = { ...settings, blogPosts: settings.blogPosts.filter((p) => p.id !== id) };
    persist();
    return structuredClone(settings);
  },
};

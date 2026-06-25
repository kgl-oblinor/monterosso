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

const DEFAULTS: SiteSettings = {
  listingTitle: "Paolona · Monterosso",
  tagline: "Stille morgener og gylne kvelder langs Cinque Terre.",
  pricePerGuest: 100,
  maxGuests: 8,
  departures: [
    { key: "sunrise", label: "Soloppgang", time: "06:00" },
    { key: "sunshine", label: "Sol", time: "11:00" },
    { key: "sunset", label: "Solnedgang", time: "18:30" },
  ],
  theme: { background: "deepblue", accent: "#ead27e" },
  blogPosts: [
    {
      id: "b1",
      title: "Velkommen ombord",
      body: "Vi gleder oss til å vise dere kysten — fra Molo dei Pescatori til de fem landsbyene.",
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

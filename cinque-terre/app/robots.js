// Next.js App Router robots (app/robots.js → /robots.txt).
// Allow all crawlers across the public site and point them at the sitemap.

const base = "https://monterosso-cinque-terre.kgl-56a.workers.dev";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

// Shared helpers for the /news section.
// Kept tiny and local to this lane (app/news/**).

const BASE = "https://monterosso-cinque-terre.kgl-56a.workers.dev";

export const NEWS_BASE = BASE;

// Format an ISO timestamp as a calm English date: "21 June 2026".
// Falls back to the raw string if it cannot be parsed.
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Split a comma/space separated tag string into a clean array.
export function parseTags(tags) {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Render article body to HTML.
// If the body already contains a block tag (<p>, <h2>, <ul>, ...), trust it
// as authored HTML. Otherwise treat blank-line-separated chunks as paragraphs,
// escaping HTML so plain text is always safe.
export function renderBody(body) {
  if (!body) return "";
  if (/<(p|h2|h3|ul|ol|blockquote|figure)\b/i.test(body)) return body;
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => `<p>${escapeHtml(chunk).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Read the DB binding, tolerating a missing Cloudflare context (e.g. at build time).
export async function getDB() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    return env?.DB || null;
  } catch {
    return null;
  }
}

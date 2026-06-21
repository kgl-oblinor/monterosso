// Shared helpers for the /discover section (SEO micro-notes).
// Kept tiny and local to this lane (app/discover/**).

export const SITE_BASE = "https://monterosso-cinque-terre.kgl-56a.workers.dev";

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

// All notes, newest first. Returns [] if the table/DB is unavailable.
export async function listNotes() {
  const db = await getDB();
  if (!db) return [];
  try {
    const { results } = await db
      .prepare(
        "SELECT id, slug, title, body, keyword, internal_link, tags, published_at " +
          "FROM seo_notes ORDER BY published_at DESC"
      )
      .all();
    return results || [];
  } catch {
    return [];
  }
}

// One note by slug, or null.
export async function getNote(slug) {
  const db = await getDB();
  if (!db) return null;
  try {
    return await db
      .prepare(
        "SELECT id, slug, title, body, keyword, internal_link, tags, published_at " +
          "FROM seo_notes WHERE slug = ?"
      )
      .bind(slug)
      .first();
  } catch {
    return null;
  }
}

// Format an ISO timestamp as a calm English date: "21 June 2026".
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

// Split a comma-separated tag string into a clean array.
export function parseTags(tags) {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Render a micro-note body to HTML. If it already contains a block tag,
// trust it as authored HTML; otherwise treat blank-line-separated chunks
// as paragraphs (escaping plain text so it is always safe).
export function renderBody(body) {
  if (!body) return "";
  if (/<(p|h2|h3|ul|ol|blockquote|figure|em|strong)\b/i.test(body)) return body;
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

// Plain-text excerpt of a body, for listing cards and meta descriptions.
export function excerpt(body, max = 160) {
  if (!body) return "";
  const text = body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

// A friendly label for an internal link path, e.g. "/" → "the sea tour".
export function linkLabel(path) {
  if (!path) return "";
  const map = {
    "/": "the private sea tour",
    "/monterosso": "the Monterosso guide",
    "/guide": "the Cinque Terre guide",
    "/cinque-terre-by-boat": "Cinque Terre by boat",
    "/news": "the latest from the coast",
  };
  if (map[path]) return map[path];
  // Fall back to the last path segment, prettified.
  const seg = path.replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
  return seg.replace(/-/g, " ") || "read more";
}

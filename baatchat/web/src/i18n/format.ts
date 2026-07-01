// Locale-aware date / time / relative-time helpers. Replaces the hardcoded "nb-NO" in
// api/threads.ts — pass the active locale (from useLocale()) and the right BCP-47 tag is used.
import { dictionary, type Locale } from "./dictionary";

/** i18n locale → BCP-47 tag for Intl formatting. */
const LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  it: "it-IT",
  nb: "nb-NO",
};

/** Accepts a Date, an ISO string, or a D1 naive-UTC string ("YYYY-MM-DD HH:MM:SS"). */
function toDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  // D1's datetime('now') yields naive UTC — parse it as UTC, not local.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(input)) return new Date(input.replace(" ", "T") + "Z");
  return new Date(input);
}

/** Day/month/year date label, e.g. "21/06/2025" (en-GB) · "21.06.2025" (nb-NO). */
export function formatDate(input: string | Date, locale: Locale): string {
  if (!input) return "";
  const d = toDate(input);
  if (isNaN(d.getTime())) return typeof input === "string" ? input : "";
  return d.toLocaleDateString(LOCALE_TAG[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Clock label for a single moment, e.g. "09:48". */
export function formatTime(input: string | Date, locale: Locale): string {
  if (!input) return "";
  const d = toDate(input);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(LOCALE_TAG[locale], { hour: "2-digit", minute: "2-digit" });
}

/** Short relative label for a conversation row: today → time, yesterday → localized word,
 *  otherwise a short day/month date. */
export function formatRelative(input: string | Date | null, locale: Locale): string {
  if (!input) return "";
  const d = toDate(input);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return formatTime(d, locale);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return dictionary["chat.relative.yesterday"][locale];
  }
  return d.toLocaleDateString(LOCALE_TAG[locale], { day: "2-digit", month: "2-digit" });
}

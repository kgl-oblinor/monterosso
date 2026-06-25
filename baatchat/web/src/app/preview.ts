// Flow-overview preview mode. The /flow.html board (in the cinque-terre app) shows
// live miniatures of every screen. The protected dashboard sits behind login, so for
// the board we let ?preview=<role> inject a mock session and ?section=<key> deep-link
// a section — but ONLY in mock builds. In the real, mocks-off production deploy this is
// a no-op, so real authentication is never weakened.
import { useAuthStore } from "@/features/auth/store";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/api/types";
import { type SectionKey } from "@/features/dashboard/sections";

const ROLES: UserRole[] = ["customer", "skipper", "admin"];
const SECTIONS: SectionKey[] = [
  "home", "chat", "trips", "receipts",
  "otherTrips", "otherCountries", "customers", "profile", "site",
];

/** ?preview=<role> → inject a mock active session so the protected dashboard renders
 *  without login. Call once, before the React tree mounts. Mock builds only. */
export function applyPreviewSession(): void {
  if (!env.useMocks) return;
  const role = new URLSearchParams(window.location.search).get("preview");
  if (!role || !ROLES.includes(role as UserRole)) return;
  useAuthStore.getState().setSession(
    `preview.${role}.jwt`,
    { id: 1, email: `${role}@preview.local`, name: "Preview", role: role as UserRole },
    "active"
  );
}

/** ?section=<key> → which dashboard section the board wants to show. null if absent/invalid. */
export function previewSection(): SectionKey | null {
  const s = new URLSearchParams(window.location.search).get("section");
  return s && SECTIONS.includes(s as SectionKey) ? (s as SectionKey) : null;
}

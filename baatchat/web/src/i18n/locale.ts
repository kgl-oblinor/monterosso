// Resolves the active UI locale from the logged-in user's ROLE (via the auth store):
//   customer → 'en'  (international travellers)
//   skipper  → 'it'  (Andrea)
//   admin    → 'nb'  (Kristian)
// Unknown / not-signed-in falls back to 'en'.
import { useAuthStore } from "@/features/auth/store";
import type { UserRole } from "@/features/auth/api/types";
import { DEFAULT_LOCALE, type Locale } from "./dictionary";

const ROLE_LOCALE: Record<UserRole, Locale> = {
  customer: "en",
  skipper: "it",
  admin: "nb",
};

/** Pure mapping — handy for non-hook contexts (tests, data helpers). */
export function localeForRole(role: UserRole | undefined): Locale {
  return (role && ROLE_LOCALE[role]) || DEFAULT_LOCALE;
}

/** The active locale for the signed-in user. Re-renders when the user/role changes. */
export function useLocale(): Locale {
  const role = useAuthStore((s) => s.user?.role);
  return localeForRole(role);
}

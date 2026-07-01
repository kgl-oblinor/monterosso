// Role-differentiated navigation for the web-app shell. The icon rail and the section
// views both read from here so the two roles never drift.
//
// MÅL menu order (customer-facing): Chat · Turer. The old "coming soon" entries
// (Kvitteringer / Andre reiser / Andre land) were dropped from the customer rail — they
// were dead ends that confused older users; the sections stay defined but off the nav.
// On sign-in we land on a calm "Hjem" overview (not straight into chat) — Hjem sits at the
// top of the rail, with Chat right below it. The profile avatar lives at the bottom (IconRail).
import { Anchor, Compass, Message, Sail } from "@/components/icons";
import type { IconComponent } from "@/components/icons";

import type { TranslationKey } from "@/i18n";
import type { UserRole } from "@/features/auth/api/types";

export type SectionKey =
  | "home"
  | "chat"
  | "trips"
  | "site"
  | "profile"; // reached via the avatar at the bottom of the rail, not a nav item

/** Where every role lands on sign-in: the calm home overview. */
export const DEFAULT_SECTION: SectionKey = "home";

export interface NavItem {
  key: SectionKey;
  icon: IconComponent;
  /** i18n key — resolved with t() at render (IconRail + the home shortcut grid). */
  labelKey: TranslationKey;
}

const HOME: NavItem = { key: "home", icon: Anchor, labelKey: "nav.home" };
const CHAT: NavItem = { key: "chat", icon: Message, labelKey: "nav.chat" };

const CUSTOMER_NAV: NavItem[] = [
  HOME,
  CHAT,
  { key: "trips", icon: Compass, labelKey: "nav.trips" },
];

const SKIPPER_NAV: NavItem[] = [
  HOME,
  CHAT,
  { key: "trips", icon: Compass, labelKey: "nav.departures" },
  { key: "site", icon: Sail, labelKey: "nav.site" },
];

/** The nav items for a role. Unknown/admin roles fall back to Hjem + Chat. */
export function navForRole(role: UserRole | undefined): NavItem[] {
  if (role === "customer") return CUSTOMER_NAV;
  if (role === "skipper") return SKIPPER_NAV;
  return [HOME, CHAT];
}

/** The role's section shortcuts shown on the home screen — everything except Hjem itself. */
export function shortcutsForRole(role: UserRole | undefined): NavItem[] {
  return navForRole(role).filter((item) => item.key !== "home");
}

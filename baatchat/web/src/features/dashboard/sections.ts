// Role-differentiated navigation for the web-app shell. The icon rail and the section
// views both read from here so the two roles never drift.
//
// MÅL menu order (customer-facing): Chat · Turer. The old "coming soon" entries
// (Kvitteringer / Andre reiser / Andre land) were dropped from the customer rail — they
// were dead ends that confused older users; the sections stay defined but off the nav.
// On sign-in we land on a calm "Hjem" overview (not straight into chat) — Hjem sits at the
// top of the rail, with Chat right below it. The profile avatar lives at the bottom (IconRail).
import { Anchor, Compass, LayoutPanelLeft, MessageSquare, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/features/auth/api/types";

export type SectionKey =
  | "home"
  | "chat"
  | "trips"
  | "receipts"
  | "otherTrips"
  | "otherCountries"
  | "customers"
  | "site"
  | "profile"; // reached via the avatar at the bottom of the rail, not a nav item

/** Where every role lands on sign-in: the calm home overview. */
export const DEFAULT_SECTION: SectionKey = "home";

export interface NavItem {
  key: SectionKey;
  icon: LucideIcon;
  label: string;
}

const HOME: NavItem = { key: "home", icon: Anchor, label: "Hjem" };
const CHAT: NavItem = { key: "chat", icon: MessageSquare, label: "Chat" };

const CUSTOMER_NAV: NavItem[] = [
  HOME,
  CHAT,
  { key: "trips", icon: Compass, label: "Turer" },
];

const SKIPPER_NAV: NavItem[] = [
  HOME,
  CHAT,
  { key: "trips", icon: Compass, label: "Mine avganger" },
  { key: "customers", icon: Users, label: "Kunder" },
  { key: "site", icon: LayoutPanelLeft, label: "Min side" },
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

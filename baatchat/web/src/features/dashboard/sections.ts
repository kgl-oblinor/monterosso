// Role-differentiated navigation for the web-app shell. The icon rail and the section
// views both read from here so the two roles never drift.
//
// MÅL menu order:
//   CUSTOMER:  Chat · Turer · Kvitteringer · Andre reiser · Andre land
//   SKIPPER:   Chat · Turer (mine avganger) · Kunder
// Chat is always first; the profile avatar lives at the bottom of the rail (in IconRail).
import { Compass, Globe, MessageSquare, Receipt, Ship, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/features/auth/api/types";

export type SectionKey = "chat" | "trips" | "receipts" | "otherTrips" | "otherCountries" | "customers";

export interface NavItem {
  key: SectionKey;
  icon: LucideIcon;
  label: string;
}

const CHAT: NavItem = { key: "chat", icon: MessageSquare, label: "Chat" };

const CUSTOMER_NAV: NavItem[] = [
  CHAT,
  { key: "trips", icon: Compass, label: "Turer" },
  { key: "receipts", icon: Receipt, label: "Kvitteringer" },
  { key: "otherTrips", icon: Ship, label: "Andre reiser" },
  { key: "otherCountries", icon: Globe, label: "Andre land" },
];

const SKIPPER_NAV: NavItem[] = [
  CHAT,
  { key: "trips", icon: Compass, label: "Mine avganger" },
  { key: "customers", icon: Users, label: "Kunder" },
];

/** The nav items for a role. Unknown/admin roles fall back to Chat only. */
export function navForRole(role: UserRole | undefined): NavItem[] {
  if (role === "customer") return CUSTOMER_NAV;
  if (role === "skipper") return SKIPPER_NAV;
  return [CHAT];
}

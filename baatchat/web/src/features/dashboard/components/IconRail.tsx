import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn, initialsOf } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth/store";
import logoUrl from "@/monterosso-mark.svg";
import { navForRole, type SectionKey } from "../sections";

const RAIL_STATE_KEY = "monterosso.rail.expanded";

/** Remember whether the rail is expanded across sessions (default: collapsed). */
function useRailExpanded(): [boolean, (v: boolean) => void] {
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(RAIL_STATE_KEY) === "1";
  });
  useEffect(() => {
    window.localStorage.setItem(RAIL_STATE_KEY, expanded ? "1" : "0");
  }, [expanded]);
  return [expanded, setExpanded];
}

interface IconRailProps {
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
}

/** Far-left vertical nav rail — minimalist, calm, Italian: lots of air, soft width
 *  transition, sharp corners. Default collapsed (icons only); a toggle expands it to
 *  icon + label. Hjem and Chat sit on top, the profile avatar (with logout) at the
 *  bottom. The items in between are role-differentiated (see sections.ts).
 *
 *  Mobile: collapsed it's a slim icon strip; expanded it overlays the content as a
 *  drawer (with a scrim) so the narrow viewport isn't squeezed. */
export function IconRail({ active, onSelect }: IconRailProps) {
  const user = useAuthStore((s) => s.user);
  const nav = navForRole(user?.role);
  const [expanded, setExpanded] = useRailExpanded();

  // On mobile, selecting a section collapses the overlay so the content is visible.
  const handleSelect = (key: SectionKey) => {
    onSelect(key);
    if (window.matchMedia("(max-width: 767px)").matches) setExpanded(false);
  };

  return (
    <>
      {/* Mobile scrim: tap to close the expanded drawer. */}
      {expanded && (
        <button
          type="button"
          aria-label="Lukk meny"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      <nav
        className={cn(
          "z-30 flex shrink-0 flex-col items-stretch border-r border-white/5 bg-[#07182a] py-4 transition-[width] duration-300 ease-out md:bg-transparent",
          expanded ? "w-60" : "w-16",
          // On mobile the expanded rail floats over the content as a drawer.
          expanded ? "fixed inset-y-0 left-0 md:static" : "relative"
        )}
      >
        <div className={cn("flex items-center gap-2 px-3", expanded ? "justify-between" : "justify-center")}>
          <img src={logoUrl} alt="Monterosso" className="size-9 rounded-xl" />
          {expanded && (
            <span className="truncate font-serif text-sm tracking-wide text-white/70">
              Monterosso
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Lukk sidemeny" : "Åpne sidemeny"}
          aria-expanded={expanded}
          className={cn(
            "mt-3 flex h-10 items-center gap-3 rounded-none text-white/45 transition-colors hover:bg-white/5 hover:text-white",
            expanded ? "px-4" : "justify-center px-0"
          )}
        >
          {expanded ? (
            <PanelLeftClose className="size-5 shrink-0" />
          ) : (
            <PanelLeftOpen className="size-5 shrink-0" />
          )}
          {expanded && <span className="truncate text-sm">Skjul meny</span>}
        </button>

        <div className="mt-2 flex flex-col gap-1">
          {nav.map(({ key, icon: Icon, label }) => {
            const isActive = key === active;
            return (
              <button
                key={key}
                type="button"
                title={expanded ? undefined : label}
                aria-label={label}
                aria-current={isActive}
                onClick={() => handleSelect(key)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-none transition-colors",
                  expanded ? "px-4" : "justify-center px-0",
                  isActive
                    ? "bg-[#ead27e]/15 text-[#ead27e]"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="size-5 shrink-0" />
                {expanded && <span className="truncate text-sm">{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Profile: the avatar at the bottom opens the user's own profile section. */}
        <div className={cn("mt-auto flex", expanded ? "px-3" : "justify-center")}>
          <button
            type="button"
            onClick={() => handleSelect("profile")}
            aria-label="Profil"
            aria-current={active === "profile"}
            title={expanded ? undefined : "Profil"}
            className={cn(
              "flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#ead27e]",
              expanded ? "w-full rounded-none px-1 py-1 hover:bg-white/5" : "rounded-full",
              active === "profile" && expanded && "bg-[#ead27e]/15"
            )}
          >
            <Avatar
              initials={initialsOf(user?.name ?? user?.email)}
              className={cn(
                "bg-[#ead27e]/30 text-[#ead27e]",
                active === "profile" && "ring-2 ring-[#ead27e]"
              )}
            />
            {expanded && (
              <span className="min-w-0 flex-1 truncate text-left text-sm text-white/70">
                {user?.name ?? "Profil"}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

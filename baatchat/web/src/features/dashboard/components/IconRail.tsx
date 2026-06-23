import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { cn, initialsOf } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store";
import logoUrl from "@/monterosso-mark.svg";
import { navForRole, type SectionKey } from "../sections";

interface IconRailProps {
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
}

/** Far-left vertical nav rail. Chat is on top, the profile avatar (with logout) at the
 *  bottom. The items in between are role-differentiated (see sections.ts). */
export function IconRail({ active, onSelect }: IconRailProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = navForRole(user?.role);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-white/5 py-4">
      <img src={logoUrl} alt="Monterosso" className="mb-3 size-9 rounded-xl" />

      {nav.map(({ key, icon: Icon, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            title={label}
            aria-label={label}
            aria-current={isActive}
            onClick={() => onSelect(key)}
            className={cn(
              "flex size-10 items-center justify-center rounded-xl transition-colors",
              isActive
                ? "bg-[#ead27e]/15 text-[#ead27e]"
                : "text-white/45 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="size-5" />
          </button>
        );
      })}

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#ead27e]"
            aria-label="Konto"
          >
            <Avatar
              initials={initialsOf(user?.name ?? user?.email)}
              className="bg-[#ead27e]/30 text-[#ead27e]"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            <DropdownMenuLabel>
              <div className="truncate">{user?.name ?? "Innlogget"}</div>
              {user?.email && (
                <div className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout}>
              <LogOut className="size-4" />
              Logg ut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

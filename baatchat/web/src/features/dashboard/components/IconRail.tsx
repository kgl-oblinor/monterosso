import { useNavigate } from "react-router-dom";
import { LogOut, MessageSquare } from "lucide-react";

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

// Only Chat exists today. Overview/Documents/Notifications placeholders were removed
// until those features are built — re-add NAV entries here when they are.
const NAV = [{ icon: MessageSquare, label: "Chat", active: true }];

/** Far-left vertical nav rail. The avatar at the bottom holds the logout menu. */
export function IconRail() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-white/5 py-4">
      <img src={logoUrl} alt="Monterosso" className="mb-3 size-9 rounded-xl" />

      {NAV.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          type="button"
          title={label}
          aria-label={label}
          aria-current={active}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors",
            active
              ? "bg-teal-400/15 text-teal-300"
              : "text-white/45 hover:bg-white/5 hover:text-white"
          )}
        >
          <Icon className="size-5" />
        </button>
      ))}

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label="Konto"
          >
            <Avatar
              initials={initialsOf(user?.name ?? user?.email)}
              className="bg-teal-500/30 text-teal-100"
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

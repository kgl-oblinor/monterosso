import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LayoutGrid, LogOut, Menu, MessageSquare, Ship, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import logoUrl from "@/monterosso-mark.svg";
import { useAuthStore } from "@/features/auth/store";
import { useCustomerDirectory, useSkipperDirectory, useUsers } from "./api/hooks";
import { StatCard, StatGroup } from "./components/AdminUI";
import { PendingTab } from "./components/PendingTab";
import { SkippersTab } from "./components/SkippersTab";
import { CustomersTab } from "./components/CustomersTab";
import { ConversationsTab } from "./components/ConversationsTab";

type TabId = "pending" | "skippers" | "customers" | "conversations" | "sidekart";

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof Clock;
  badge?: number;
}

export function AdminUsersPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const adminEmail = useAuthStore((s) => s.user?.email);
  const [tab, setTab] = useState<TabId>("pending");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Stats: registered accounts come from /admin/users; totals from the directories.
  const { data: users } = useUsers();
  const { data: skippers } = useSkipperDirectory();
  const { data: customerPage } = useCustomerDirectory({ search: "", page: 0, pageSize: 1 });

  const accounts = users ?? [];
  const pending = accounts.filter((u) => u.status !== "active").length;
  const active = accounts.filter((u) => u.status === "active").length;
  const regSkippers = accounts.filter((u) => u.role === "skipper").length;
  const regCustomers = accounts.filter((u) => u.role === "customer").length;
  const totalSkippers = skippers?.length;
  const totalCustomers = customerPage?.total;

  const nav: NavItem[] = [
    { id: "pending", label: "Til godkjenning", icon: Clock, badge: pending || undefined },
    { id: "skippers", label: "Skippere", icon: Ship },
    { id: "customers", label: "Kunder", icon: Users },
    { id: "conversations", label: "Samtaler", icon: MessageSquare },
    { id: "sidekart", label: "Sidekart", icon: LayoutGrid },
  ];

  const onLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const selectTab = (id: TabId) => {
    setTab(id);
    setDrawerOpen(false);
  };

  const heading = nav.find((n) => n.id === tab)?.label ?? "";

  const sidebar = (
    <SidebarContent
      nav={nav}
      tab={tab}
      adminEmail={adminEmail}
      onSelect={selectTab}
      onLogout={onLogout}
    />
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-page text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline md:flex">{sidebar}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-hairline bg-page">
            <button
              type="button"
              aria-label="Lukk meny"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-ink-muted hover:bg-black/[0.04] hover:text-ink"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-hairline px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Åpne meny"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-1.5 text-ink-muted hover:bg-black/[0.04] hover:text-ink"
          >
            <Menu className="size-5" />
          </button>
          <img src={logoUrl} alt="" className="size-7 rounded-lg" />
          <span className="font-semibold">{heading}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {tab === "sidekart" ? (
            <iframe src="/pages-grid.html" title="Sidekart" className="block h-full w-full border-0" />
          ) : (
          <div className="max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
            <h1 className="mb-6 hidden text-2xl font-semibold md:block">{heading}</h1>

            {/* Stats — only on the directory/approval tabs, not Samtaler */}
            {tab !== "conversations" && (
              <StatGroup>
                <StatCard
                  label="Skippere"
                  value={totalSkippers ?? "…"}
                  hint={<Hint n={regSkippers} suffix="med konto" />}
                  loading={totalSkippers == null}
                />
                <StatCard
                  label="Kunder"
                  value={totalCustomers?.toLocaleString("nb-NO") ?? "…"}
                  hint={<Hint n={regCustomers} suffix="med konto" />}
                  loading={totalCustomers == null}
                />
                <StatCard
                  label="Aktive kontoer"
                  value={active}
                  hint={<Hint n={accounts.length} suffix="registrerte totalt" />}
                />
                <StatCard
                  label="Venter på godkjenning"
                  value={pending}
                  hint={pending > 0 ? <Hint n={pending} suffix="i kø" /> : "ingen i kø"}
                />
              </StatGroup>
            )}

            {tab === "pending" && <PendingTab />}
            {tab === "skippers" && <SkippersTab />}
            {tab === "customers" && <CustomersTab />}
            {tab === "conversations" && <ConversationsTab />}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

/** Stat-card hint with a teal-emphasized leading number, e.g. "**1** med konto". */
function Hint({ n, suffix }: { n: number; suffix: string }) {
  return (
    <>
      <span className="font-semibold text-gold">{n.toLocaleString("nb-NO")}</span> {suffix}
    </>
  );
}

function SidebarContent({
  nav,
  tab,
  adminEmail,
  onSelect,
  onLogout,
}: {
  nav: NavItem[];
  tab: TabId;
  adminEmail?: string;
  onSelect: (id: TabId) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src={logoUrl} alt="" className="size-8 rounded-lg" />
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight">Administrasjon</div>
          <div className="truncate text-xs text-ink-muted">{adminEmail}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const Icon = n.icon;
          const activeTab = tab === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelect(n.id)}
              aria-current={activeTab}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab
                  ? "bg-surface text-gold ring-1 ring-inset ring-gold/30"
                  : "text-ink-muted hover:bg-black/[0.04] hover:text-ink"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 text-left">{n.label}</span>
              {n.badge != null && (
                <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-gold">
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
        >
          <LogOut className="size-4" /> Logg ut
        </button>
      </div>
    </>
  );
}

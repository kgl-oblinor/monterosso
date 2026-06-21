import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Clock, LogOut, Mail, Menu, MessageSquare, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import logoUrl from "@/oblinor-logo.svg";
import { useAuthStore } from "@/features/auth/store";
import { useInvestorDirectory, useLoanerDirectory, useUsers } from "./api/hooks";
import { StatCard, StatGroup } from "./components/AdminUI";
import { PendingTab } from "./components/PendingTab";
import { LoanersTab } from "./components/LoanersTab";
import { InvestorsTab } from "./components/InvestorsTab";
import { ConversationsTab } from "./components/ConversationsTab";
import { EmailTab } from "./components/EmailTab";

type TabId = "pending" | "loaners" | "investors" | "conversations" | "email";

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
  const { data: loaners } = useLoanerDirectory();
  const { data: investorPage } = useInvestorDirectory({ search: "", page: 0, pageSize: 1 });

  const accounts = users ?? [];
  const pending = accounts.filter((u) => u.status !== "active").length;
  const active = accounts.filter((u) => u.status === "active").length;
  const regLoaners = accounts.filter((u) => u.role === "loaner").length;
  const regInvestors = accounts.filter((u) => u.role === "investor").length;
  const totalLoaners = loaners?.length;
  const totalInvestors = investorPage?.total;

  const nav: NavItem[] = [
    { id: "pending", label: "Til godkjenning", icon: Clock, badge: pending || undefined },
    { id: "loaners", label: "Låntakere", icon: Building2 },
    { id: "investors", label: "Långivere", icon: Users },
    { id: "conversations", label: "Samtaler", icon: MessageSquare },
    { id: "email", label: "Epost", icon: Mail },
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
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#134e4a_0%,#0a2a2e_42%,#020617_100%)] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 md:flex">{sidebar}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-white/10 bg-[#0a242b]">
            <button
              type="button"
              aria-label="Lukk meny"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-white/50 hover:bg-white/5 hover:text-white"
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
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Åpne meny"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Menu className="size-5" />
          </button>
          <img src={logoUrl} alt="" className="size-7 rounded-lg" />
          <span className="font-semibold">{heading}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
            <h1 className="mb-6 hidden text-2xl font-semibold md:block">{heading}</h1>

            {/* Stats — only on the directory/approval tabs, not Samtaler/Epost */}
            {tab !== "conversations" && tab !== "email" && (
              <StatGroup>
                <StatCard
                  label="Låntakere"
                  value={totalLoaners ?? "…"}
                  hint={<Hint n={regLoaners} suffix="med konto" />}
                  loading={totalLoaners == null}
                />
                <StatCard
                  label="Långivere"
                  value={totalInvestors?.toLocaleString("nb-NO") ?? "…"}
                  hint={<Hint n={regInvestors} suffix="med konto" />}
                  loading={totalInvestors == null}
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
            {tab === "loaners" && <LoanersTab />}
            {tab === "investors" && <InvestorsTab />}
            {tab === "conversations" && <ConversationsTab />}
            {tab === "email" && <EmailTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Stat-card hint with a teal-emphasized leading number, e.g. "**1** med konto". */
function Hint({ n, suffix }: { n: number; suffix: string }) {
  return (
    <>
      <span className="font-semibold text-teal-300">{n.toLocaleString("nb-NO")}</span> {suffix}
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
          <div className="truncate text-xs text-white/45">{adminEmail}</div>
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
                  ? "bg-teal-400/15 text-teal-200"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 text-left">{n.label}</span>
              {n.badge != null && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300">
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" /> Logg ut
        </button>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLoanerDirectory, useSetLoanerEmail } from "../api/hooks";
import { EditableEmail, Initials, RowActions, statusRank, StatusBadge } from "./AdminUI";

const PAGE_SIZE = 50;

/** Full låntaker (borrower) directory — all synced loaners, registered or not. Paginated
 *  client-side (the list is small) so it matches the långiver table exactly. */
export function LoanersTab() {
  const { data: loaners, isLoading, isError } = useLoanerDirectory();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (loaners ?? [])
        .filter(
          (l) =>
            !q ||
            l.name?.toLowerCase().includes(q) ||
            l.orgNumber?.toLowerCase().includes(q) ||
            l.email?.toLowerCase().includes(q)
        )
        .sort(
          (a, b) =>
            statusRank(a.status) - statusRank(b.status) ||
            (a.name ?? "").localeCompare(b.name ?? "", "nb-NO")
        ),
    [loaners, q]
  );

  // Reset to the first page whenever the search narrows the list.
  useEffect(() => setPage(0), [q]);

  const total = filtered.length;
  const start = page * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} placeholder="Søk på navn, org.nr eller e-post" />

      {isLoading ? (
        <Centered>
          <Loader2 className="size-5 animate-spin" /> Laster låntakere…
        </Centered>
      ) : isError ? (
        <ErrorBox>Kunne ikke laste låntakere.</ErrorBox>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <Thead cols={["#", "Selskap", "Org.nr", "Kontakt / e-post", "Lån", "Status", "Handling"]} />
            <tbody className="divide-y divide-white/5">
              {pageRows.map((l, i) => (
                <tr key={l.id} className="transition-colors hover:bg-white/[0.04]">
                  <RowNum n={start + i + 1} />
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Initials name={l.name} fallback={l.orgNumber ?? "?"} />
                      <span className="font-medium text-white">{l.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-white/60">{l.orgNumber ?? "—"}</td>
                  <td className="px-4 py-2.5 text-white/70">
                    <div>{l.contactPerson ?? "—"}</div>
                    <LoanerEmail id={l.id} email={l.email} />
                  </td>
                  <td className="px-4 py-2.5 text-white/70">{l.loanCount}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions accountId={l.accountId} status={l.status} />
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && <EmptyRow cols={7} label="Ingen låntakere funnet." />}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        from={from}
        to={to}
        total={total}
        hasPrev={page > 0}
        hasNext={to < total}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
}

/** A loaner's editable on-file email (admin override). */
function LoanerEmail({ id, email }: { id: number; email: string | null }) {
  const setEmail = useSetLoanerEmail();
  return (
    <EditableEmail
      email={email}
      saving={setEmail.isPending}
      onSave={(e) => setEmail.mutateAsync({ id, email: e })}
    />
  );
}

// --- shared table chrome (used by both directory tables) --------------------

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-4 max-w-sm">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-teal-400/50 focus:outline-none"
      />
    </div>
  );
}

export function Thead({ cols }: { cols: string[] }) {
  return (
    <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-white/45">
      <tr>
        {cols.map((c, i) => (
          <th
            key={c}
            className={cn(
              "px-4 py-2.5 font-medium",
              i === cols.length - 1 && "text-right",
              c === "#" && "w-12 text-center"
            )}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Leading row-number cell (continuous across pages). */
export function RowNum({ n }: { n: number }) {
  return (
    <td className="w-12 px-4 py-2.5 text-center text-xs tabular-nums text-white/35">{n}</td>
  );
}

export function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-white/40">
        {label}
      </td>
    </tr>
  );
}

export function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 py-16 text-sm text-white/50">{children}</div>;
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {children}
    </div>
  );
}

/** Footer with "Viser X–Y av Z" + prev/next arrows. Shared by both directory tables. */
export function Pager({
  from,
  to,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  isFetching,
}: {
  from: number;
  to: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isFetching?: boolean;
}) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-white/45">
      <span className="flex items-center gap-2">
        {total > 0 ? `Viser ${from}–${to} av ${total.toLocaleString("nb-NO")}` : "—"}
        {isFetching && <Loader2 className="size-3 animate-spin" />}
      </span>
      <div className="flex items-center gap-1">
        <PageButton disabled={!hasPrev} onClick={onPrev}>
          <ChevronLeft className="size-4" />
        </PageButton>
        <PageButton disabled={!hasNext} onClick={onNext}>
          <ChevronRight className="size-4" />
        </PageButton>
      </div>
    </div>
  );
}

export function PageButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/5 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

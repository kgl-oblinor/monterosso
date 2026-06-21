import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSkippers } from "../api/hooks";
import type { Skipper } from "../api/types";
import { Initials } from "./AdminUI";
import { SkipperForm } from "./SkipperForm";

const SERVICE_LABEL: Record<string, string> = {
  charter: "Charter",
  taxi: "Taxibåt",
  freight: "Frakt",
};

type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; skipper: Skipper };

/** Skipper management: the list of listings, plus the add/edit form. This is where
 *  Kristian creates a skipper (name, contact, boat, service type, departure times,
 *  price, payment ref). Backed by GET/POST/PUT /admin/skippers. */
export function SkippersTab() {
  const { data: skippers, isLoading, isError } = useSkippers();
  const [view, setView] = useState<View>({ mode: "list" });
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (skippers ?? [])
        .filter(
          (s) =>
            !q ||
            s.name?.toLowerCase().includes(q) ||
            s.boat_name?.toLowerCase().includes(q) ||
            s.location?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        )
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "nb-NO")),
    [skippers, q]
  );

  if (view.mode !== "list") {
    return (
      <SkipperForm
        skipper={view.mode === "edit" ? view.skipper : undefined}
        onDone={() => setView({ mode: "list" })}
        onCancel={() => setView({ mode: "list" })}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SearchBox value={query} onChange={setQuery} placeholder="Søk på navn, båt, sted eller e-post" />
        <button
          type="button"
          onClick={() => setView({ mode: "new" })}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-teal-400 px-4 text-sm font-semibold text-[#04231d] transition-opacity hover:bg-teal-300"
        >
          <Plus className="size-4" /> Legg til skipper
        </button>
      </div>

      {isLoading ? (
        <Centered>
          <Loader2 className="size-5 animate-spin" /> Laster skippere…
        </Centered>
      ) : isError ? (
        <ErrorBox>Kunne ikke laste skippere.</ErrorBox>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <Thead cols={["#", "Skipper / båt", "Tjeneste", "Kontakt", "Pris", "Status", "Handling"]} />
            <tbody className="divide-y divide-white/5">
              {filtered.map((s, i) => (
                <tr key={s.id} className="transition-colors hover:bg-white/[0.04]">
                  <RowNum n={i + 1} />
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Initials name={s.name ?? s.boat_name} fallback={s.boat_name ?? "?"} />
                      <div className="min-w-0">
                        <div className="font-medium text-white">{s.name || "—"}</div>
                        {s.boat_name && <div className="text-xs text-white/45">{s.boat_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-white/70">
                    {SERVICE_LABEL[s.service_type] ?? s.service_type}
                    {s.location && <span className="text-white/40"> · {s.location}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-white/70">
                    {s.email || s.phone || <span className="text-white/30">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-white/70">{formatPrice(s)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                        s.active
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                          : "bg-white/5 text-white/40 ring-white/10"
                      )}
                    >
                      {s.active ? "Aktiv" : "Skjult"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setView({ mode: "edit", skipper: s })}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/15 px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/5"
                      >
                        <Pencil className="size-3.5" /> Rediger
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <EmptyRow cols={7} label="Ingen skippere ennå. Trykk «Legg til skipper»." />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Price label, e.g. "150 EUR". Empty when no price is set. */
function formatPrice(s: Skipper): string {
  if (s.base_price == null) return "—";
  return `${(s.base_price / 100).toLocaleString("nb-NO")} ${s.currency ?? ""}`.trim();
}

// --- shared table chrome (used by both directory tables + the others) --------

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

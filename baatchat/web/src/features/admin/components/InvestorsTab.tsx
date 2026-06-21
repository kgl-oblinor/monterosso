import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useInvestorDirectory, useSetInvestorEmail } from "../api/hooks";
import { EditableEmail, Initials, RowActions, StatusBadge } from "./AdminUI";
import { Centered, EmptyRow, ErrorBox, Pager, RowNum, SearchBox, Thead } from "./LoanersTab";

const PAGE_SIZE = 50;

/** Långiver (investor) directory — 9k+ rows, so server-side search + pagination. Shares
 *  all table chrome with the låntaker table so the two look identical. */
export function InvestorsTab() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Debounce the search input; reset to the first page on a new term.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, isFetching } = useInvestorDirectory({
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const investors = data?.investors ?? [];
  const start = page * PAGE_SIZE;
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} placeholder="Søk på navn eller e-post" />

      {isLoading ? (
        <Centered>
          <Loader2 className="size-5 animate-spin" /> Laster långivere…
        </Centered>
      ) : isError ? (
        <ErrorBox>Kunne ikke laste långivere.</ErrorBox>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <Thead cols={["#", "Navn", "E-post", "Ordre", "Status", "Handling"]} />
            <tbody className="divide-y divide-white/5">
              {investors.map((iv, i) => (
                <tr key={iv.id} className="transition-colors hover:bg-white/[0.04]">
                  <RowNum n={start + i + 1} />
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Initials name={iv.name} fallback={iv.email ?? "?"} />
                      <span className="font-medium text-white">{iv.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-white/70">
                    <InvestorEmail id={iv.id} email={iv.email} />
                  </td>
                  <td className="px-4 py-2.5 text-white/70">{iv.orderCount}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={iv.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions accountId={iv.accountId} status={iv.status} />
                  </td>
                </tr>
              ))}
              {investors.length === 0 && <EmptyRow cols={6} label="Ingen långivere funnet." />}
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
        isFetching={isFetching}
      />
    </div>
  );
}

/** An investor's editable on-file email (admin override). */
function InvestorEmail({ id, email }: { id: number; email: string | null }) {
  const setEmail = useSetInvestorEmail();
  return (
    <EditableEmail
      email={email}
      saving={setEmail.isPending}
      onSave={(e) => setEmail.mutateAsync({ id, email: e })}
    />
  );
}

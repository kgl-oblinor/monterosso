import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useCustomerDirectory, useSetCustomerEmail } from "../api/hooks";
import { EditableEmail, Initials, RowActions, StatusBadge } from "./AdminUI";
import { Centered, EmptyRow, ErrorBox, Pager, RowNum, SearchBox, Thead } from "./SkippersTab";

const PAGE_SIZE = 50;

/** Customer directory — server-side search + pagination. Shares all table chrome with
 *  the skipper table so the two look identical. */
export function CustomersTab() {
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

  const { data, isLoading, isError, isFetching } = useCustomerDirectory({
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const customers = data?.customers ?? [];
  const start = page * PAGE_SIZE;
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} placeholder="Søk på navn eller e-post" />

      {isLoading ? (
        <Centered>
          <Loader2 className="size-5 animate-spin" /> Laster kunder…
        </Centered>
      ) : isError ? (
        <ErrorBox>Kunne ikke laste kunder.</ErrorBox>
      ) : (
        <div className="overflow-x-auto rounded-card border border-hairline shadow-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <Thead cols={["#", "Navn", "E-post", "Turer", "Status", "Handling"]} />
            <tbody className="divide-y divide-hairline">
              {customers.map((c, i) => (
                <tr key={c.id} className="transition-colors hover:bg-black/[0.04]">
                  <RowNum n={start + i + 1} />
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Initials name={c.name} fallback={c.email ?? "?"} />
                      <span className="font-medium text-ink">{c.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    <CustomerEmail id={c.id} email={c.email} />
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{c.reservationCount}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions accountId={c.accountId} status={c.status} />
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <EmptyRow cols={6} label="Ingen kunder funnet." />}
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

/** A customer's editable on-file email (admin override). */
function CustomerEmail({ id, email }: { id: number; email: string | null }) {
  const setEmail = useSetCustomerEmail();
  return (
    <EditableEmail
      email={email}
      saving={setEmail.isPending}
      onSave={(e) => setEmail.mutateAsync({ id, email: e })}
    />
  );
}

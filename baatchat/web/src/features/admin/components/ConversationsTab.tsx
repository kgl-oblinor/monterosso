import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAdminThreadMessages, useAdminThreads } from "../api/hooks";
import { Initials } from "./AdminUI";
import { Centered, ErrorBox, SearchBox } from "./LoanersTab";

function initialsOf(name: string | null, fallback: string): string {
  const src = name?.trim() || fallback;
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

const PAGE_SIZE = 50;

function parseUtc(s: string): Date {
  return new Date(s.replace(" ", "T") + "Z");
}
function clock(s: string): string {
  return parseUtc(s).toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Read-only oversight of every conversation: searchable/paginated thread list (left) +
 *  messages (right). */
export function ConversationsTab() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // On narrow screens we show one pane at a time: the list, or (when a thread is opened)
  // the messages with a back button. lg+ shows both side-by-side.
  const [openOnMobile, setOpenOnMobile] = useState(false);

  // Debounce search; reset to first page on a new term.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, isFetching } = useAdminThreads({
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const threads = data?.threads ?? [];
  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  // Default-select the first thread on the current page if nothing (valid) is selected.
  useEffect(() => {
    if (threads.length && !threads.some((t) => t.id === selectedId)) {
      setSelectedId(threads[0].id);
    }
  }, [threads, selectedId]);

  return (
    <div className="lg:grid lg:gap-4 lg:grid-cols-[340px_1fr]">
      {/* Thread list — hidden on mobile while a conversation is open */}
      <div className={cn(openOnMobile && "hidden lg:block")}>
        <SearchBox value={query} onChange={setQuery} placeholder="Søk på låntaker eller långiver" />

        {isLoading ? (
          <Centered>
            <Loader2 className="size-5 animate-spin" /> Laster samtaler…
          </Centered>
        ) : isError ? (
          <ErrorBox>Kunne ikke laste samtaler.</ErrorBox>
        ) : threads.length === 0 ? (
          <div className="rounded-xl border border-white/10 px-4 py-16 text-center text-sm text-white/40">
            Ingen samtaler funnet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <ul className="h-[64vh] divide-y divide-white/5 overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(t.id);
                      setOpenOnMobile(true);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.03]",
                      t.id === selectedId && "bg-teal-500/10"
                    )}
                  >
                    <Initials name={t.loanerName} fallback="?" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {t.loanerName ?? `Låntaker #${t.loanerId}`}
                        </span>
                        <span className="shrink-0 text-[11px] text-white/35">
                          {t.lastMessageAt ? clock(t.lastMessageAt).split(",")[0] : ""}
                        </span>
                      </div>
                      <div className="truncate text-xs text-white/45">
                        ↔ {t.investorName ?? `Långiver #${t.investorId}`}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-white/40">
                        {t.preview || "Ingen meldinger"} · {t.messageCount} meld.
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-white/45">
          <span className="flex items-center gap-2">
            {total > 0 ? `Viser ${from}–${to} av ${total.toLocaleString("nb-NO")}` : "—"}
            {isFetching && <Loader2 className="size-3 animate-spin" />}
          </span>
          <div className="flex items-center gap-1">
            <PageButton disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className="size-4" />
            </PageButton>
            <PageButton disabled={to >= total} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </PageButton>
          </div>
        </div>
      </div>

      {/* Messages — hidden on mobile until a conversation is opened */}
      <div className={cn(openOnMobile ? "block" : "hidden lg:block")}>
        <MessagePanel threadId={selectedId} onBack={() => setOpenOnMobile(false)} />
      </div>
    </div>
  );
}

function PageButton({
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

function MessagePanel({ threadId, onBack }: { threadId: number | null; onBack: () => void }) {
  const { data, isLoading } = useAdminThreadMessages(threadId);

  if (threadId == null) {
    return (
      <div className="flex h-[72vh] items-center justify-center rounded-xl border border-white/10 text-sm text-white/40">
        Velg en samtale.
      </div>
    );
  }

  return (
    <div className="flex h-[72vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.015]">
      {data?.thread && (
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <button
            type="button"
            aria-label="Tilbake til samtaler"
            onClick={onBack}
            className="-ml-1 flex size-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/5 lg:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Avatar initials={initialsOf(data.thread.loanerName, "?")} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
              {data.thread.loanerName ?? `Låntaker #${data.thread.loanerId}`}
              <span className="text-white/40">↔</span>
              <span className="font-normal text-white/70">
                {data.thread.investorName ?? `Långiver #${data.thread.investorId}`}
              </span>
            </div>
            <div className="text-xs text-white/45">Låntaker ↔ Långiver</div>
          </div>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/40">
            kun lesing
          </span>
        </header>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {isLoading ? (
          <div className="flex justify-center pt-8 text-white/40">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : !data?.messages.length ? (
          <p className="pt-10 text-center text-sm text-white/40">Ingen meldinger i denne samtalen.</p>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">Meldinger</span>
            </div>
            {data.messages.map((m) => {
              const fromInvestor = m.senderRole === "investor";
              return (
                <div
                  key={m.id}
                  className={cn("flex flex-col", fromInvestor ? "items-end" : "items-start")}
                >
                  <span className="mb-1 px-1 text-[11px] text-white/40">
                    {fromInvestor ? "Långiver" : "Låntaker"}
                  </span>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm md:max-w-[72%]",
                      fromInvestor
                        ? "rounded-br-md bg-teal-600/70 text-white"
                        : "rounded-bl-md bg-white/[0.07] text-white/90"
                    )}
                  >
                    {m.body}
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-white/35">{clock(m.createdAt)}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

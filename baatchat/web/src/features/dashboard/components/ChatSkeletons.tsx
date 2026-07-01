import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder for the conversations sidebar — mirrors ConversationsPanel:
 *  title, search box, "Kontakter" label, then a list of avatar + two-line rows. */
export function ConversationsPanelSkeleton({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "min-w-0 flex-1 flex-col border-r border-hairline md:w-[320px] md:flex-none",
        className
      )}
    >
      <div className="px-4 pb-3 pt-5">
        <Skeleton className="mb-4 h-7 w-20 bg-black/[0.06]" />
        <Skeleton className="h-11 w-full rounded-pill bg-black/[0.06]" />
      </div>
      <div className="px-4 pb-2 pt-2">
        <Skeleton className="h-3 w-24 bg-black/[0.06]" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2">
        <ul className="space-y-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-12 shrink-0 rounded-full bg-black/[0.06]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Skeleton className="h-4 w-32 bg-black/[0.06]" />
                  <Skeleton className="h-3 w-8 bg-black/[0.06]" />
                </div>
                <Skeleton className="mt-2 h-3 w-40 bg-black/[0.06]" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** Loading placeholder for the active thread — mirrors ChatThread:
 *  header (avatar + name/subtitle), a run of alternating message bubbles, composer. */
export function ChatThreadSkeleton({ className }: { className?: string }) {
  const rows = [
    { mine: false, w: "w-48" },
    { mine: true, w: "w-32" },
    { mine: false, w: "w-56" },
    { mine: true, w: "w-40" },
    { mine: false, w: "w-36" },
  ];
  return (
    <section className={cn("min-w-0 flex-1 flex-col", className)}>
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-hairline px-4 py-3 md:px-6">
        <Skeleton className="size-10 shrink-0 rounded-full bg-black/[0.06]" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-40 bg-black/[0.06]" />
          <Skeleton className="mt-2 h-3 w-20 bg-black/[0.06]" />
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-4 py-4 md:px-6">
        {rows.map((r, i) => (
          <div key={i} className={cn("flex flex-col", r.mine ? "items-end" : "items-start")}>
            <Skeleton
              className={cn(
                "h-10 rounded-card bg-black/[0.06]",
                r.w,
                r.mine ? "rounded-br-md" : "rounded-bl-md"
              )}
            />
            <Skeleton className="mt-1 h-2.5 w-8 bg-black/[0.06]" />
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-hairline px-4 py-3">
        <Skeleton className="h-11 flex-1 rounded-input bg-black/[0.06]" />
        <Skeleton className="size-11 shrink-0 rounded-full bg-black/[0.06]" />
      </div>
    </section>
  );
}

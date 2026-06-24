import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Loader2, SendHorizontal, Ship, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import { useAuthStore } from "@/features/auth/store";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatTripDate,
  messageClock,
  useContactReservations,
  useEnsureThread,
  useMessages,
  useSendMessage,
  type ChatMessage,
  type Conversation,
} from "../api/threads";

/** Main chat pane: contact header, message list, and composer — backed by the real API.
 *  Messages poll on an interval (see useMessages). The thread row is created lazily on the
 *  first send, so browsing contacts doesn't spawn empty threads. */
export function ChatThread({
  conversation,
  myId,
  onBack,
  className,
}: {
  conversation: Conversation;
  myId: number | null;
  onBack?: () => void;
  className?: string;
}) {
  // Sender identity is (role, party_id): party ids are unique only *within* a role, so
  // skipper #1 and customer #1 collide. Pair the id with the role to tell sides apart.
  const myRole = useAuthStore((s) => s.user?.role ?? null);
  // Direct conversations always carry these; coalesce for the shared optional type.
  const contactId = conversation.contactId as number;
  const [threadId, setThreadId] = useState<number | null>(conversation.threadId ?? null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const ensureThread = useEnsureThread();
  const sendMessage = useSendMessage();
  const { data: messages, isLoading, error } = useMessages(threadId);

  // Reset thread id when the selected conversation changes (parent re-keys, but be safe).
  useEffect(() => {
    setThreadId(conversation.threadId ?? null);
    setDraft("");
    setSendError(false);
  }, [conversation.contactId, conversation.threadId]);

  // Self-heal: if the thread no longer exists (404 — e.g. deleted server-side), drop the
  // stale id so the empty state shows and the next send re-creates a fresh thread.
  useEffect(() => {
    if (error instanceof ApiError && error.status === 404) setThreadId(null);
  }, [error]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Auto-grow the composer with its content (capped, then it scrolls).
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [draft]);

  const locked = conversation.status === "locked";
  const sending = ensureThread.isPending || sendMessage.isPending;

  const WORD_LIMIT = 500;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const tooLong = wordCount > WORD_LIMIT;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending || tooLong) return;
    setSendError(false);
    try {
      let tid = threadId;
      if (tid == null) {
        tid = await ensureThread.mutateAsync(contactId);
        setThreadId(tid);
      }
      try {
        await sendMessage.mutateAsync({ threadId: tid, body });
      } catch (err) {
        // Stale/deleted thread → open a fresh one for this contact and retry once.
        if (err instanceof ApiError && err.status === 404) {
          const fresh = await ensureThread.mutateAsync(contactId);
          setThreadId(fresh);
          await sendMessage.mutateAsync({ threadId: fresh, body });
        } else {
          throw err;
        }
      }
      setDraft("");
    } catch {
      // Keep the draft so the user can retry, and surface a calm inline notice.
      setSendError(true);
    }
  };

  return (
    <section className={cn("min-w-0 flex-1 flex-col", className)}>
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3 md:px-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Tilbake til samtaler"
            className="-ml-1 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <Avatar initials={conversation.initials} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{conversation.name}</div>
          <div className="text-xs text-white/50">{conversation.subtitle}</div>
        </div>
      </header>

      {/* Which reservation(s)/trip this conversation is about */}
      <ReservationContext contactId={contactId} />

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {isLoading && threadId != null ? (
          <MessagesSkeleton />
        ) : !messages?.length ? (
          <p className="pt-10 text-center text-sm text-white/40">
            Ingen meldinger ennå. Send den første meldingen for å starte samtalen.
          </p>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                Meldinger
              </span>
            </div>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                mine={m.senderId === myId && m.senderRole === myRole}
              />
            ))}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      {locked ? (
        <div className="border-t border-white/5 px-4 py-4 text-center text-sm text-white/40">
          Denne samtalen er låst.
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={send}
          className="border-t border-white/5 px-4 py-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends; Shift+Enter inserts a newline.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              rows={1}
              placeholder="Skriv en melding …"
              aria-label="Skriv en melding"
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/40 focus:border-[#ead27e]/50 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send melding"
              disabled={!draft.trim() || sending || tooLong}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ead27e] text-[#07182a] transition-opacity hover:bg-[#f0dd9a] disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <SendHorizontal className="size-5" />
              )}
            </button>
          </div>
          {sendError && (
            <p role="alert" className="mt-1.5 px-1 text-xs text-red-300">
              Meldingen ble ikke sendt. Sjekk nettforbindelsen og prøv igjen.
            </p>
          )}
          {wordCount >= WORD_LIMIT * 0.8 && (
            <p
              className={cn(
                "mt-1.5 px-1 text-right text-xs tabular-nums",
                tooLong ? "text-red-300" : "text-white/40"
              )}
            >
              {wordCount} / {WORD_LIMIT} ord{tooLong ? " · maks 500" : ""}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

/** Collapsible strip showing which reservation(s)/trip the conversation concerns. A
 *  customer may have several bookings with the same skipper; this clarifies which. */
function ReservationContext({ contactId }: { contactId: number }) {
  const { data: reservations } = useContactReservations(contactId);
  const [open, setOpen] = useState(false);

  if (!reservations || reservations.length === 0) return null;

  const tripLabel = `${reservations.length} ${reservations.length === 1 ? "tur" : "turer"}`;

  return (
    <div className="border-b border-white/5 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/[0.03] md:px-6"
      >
        <Ship className="size-3.5 shrink-0 text-[#ead27e]/70" />
        <span className="text-xs font-medium text-white/50">Gjelder</span>
        <span className="truncate text-xs text-white/75">
          {reservations.length === 1
            ? `${reservations[0].code}${
                reservations[0].tripDate ? ` · ${formatTripDate(reservations[0].tripDate)}` : ""
              }`
            : tripLabel}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-white/40 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <ul className="max-h-48 space-y-0.5 overflow-y-auto px-4 pb-2 md:px-6">
          {reservations.map((r) => (
            <li
              key={r.code}
              className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1 text-xs hover:bg-white/[0.03]"
            >
              <span className="shrink-0 font-mono text-white/40">{r.code}</span>
              <span className="min-w-0 flex-1 truncate text-white/75">
                {r.tripDate ? formatTripDate(r.tripDate) : "Ukjent dato"}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-white/45">
                <Users className="size-3" />
                {r.guests ?? "?"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MessagesSkeleton() {
  const rows = [
    { mine: false, w: "w-48" },
    { mine: true, w: "w-32" },
    { mine: false, w: "w-56" },
    { mine: true, w: "w-40" },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <div key={i} className={cn("flex flex-col", r.mine ? "items-end" : "items-start")}>
          <Skeleton
            className={cn("h-10 rounded-3xl", r.w, r.mine ? "rounded-br-lg" : "rounded-bl-lg")}
          />
          <Skeleton className="mt-1 h-2.5 w-8" />
        </div>
      ))}
    </>
  );
}

export function MessageBubble({
  message,
  mine,
  senderLabel,
}: {
  message: ChatMessage;
  mine: boolean;
  senderLabel?: string | null;
}) {
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      {/* In a group thread, label other people's bubbles with who sent them. */}
      {!mine && senderLabel && (
        <span className="mb-0.5 px-1 text-[11px] font-medium text-[#ead27e]/80">{senderLabel}</span>
      )}
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.12)] md:max-w-[72%]",
          mine
            ? "rounded-br-lg bg-[#ead27e] text-[#07182a]"
            : "rounded-bl-lg bg-white/[0.14] text-white ring-1 ring-inset ring-white/10"
        )}
      >
        {message.body}
      </div>
      <span className="mt-1 px-1 text-[11px] text-white/35">
        {messageClock(message.createdAt)}
      </span>
    </div>
  );
}

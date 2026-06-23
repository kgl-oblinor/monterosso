import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, SendHorizontal, UserPlus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import { useAuthStore } from "@/features/auth/store";
import { Avatar } from "@/components/ui/avatar";
import { MessageBubble, MessagesSkeleton } from "./ChatThread";
import { InviteDialog } from "./InviteDialog";
import {
  useEnsureTripThread,
  useSendTripMessage,
  useTripMessages,
} from "../api/group";
import type { Conversation } from "../api/threads";

/** Group/trip chat pane ("turfølget"): a shared conversation for everyone on a reservation +
 *  the skipper. Mirrors ChatThread (poll, lazy thread creation, composer) but addresses the
 *  group trip-thread API, names each sender, and offers "Inviter reisefølget". */
export function GroupThread({
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
  const myRole = useAuthStore((s) => s.user?.role ?? null);
  const reservationId = conversation.reservationId as number;
  const reservationCode = conversation.reservationCode ?? "";
  const [tripThreadId, setTripThreadId] = useState<number | null>(conversation.tripThreadId ?? null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const ensureThread = useEnsureTripThread();
  const sendMessage = useSendTripMessage();
  const { data: messages, isLoading, error } = useTripMessages(tripThreadId);

  useEffect(() => {
    setTripThreadId(conversation.tripThreadId ?? null);
    setDraft("");
    setSendError(false);
  }, [conversation.reservationId, conversation.tripThreadId]);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 404) setTripThreadId(null);
  }, [error]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

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
      let tid = tripThreadId;
      if (tid == null) {
        tid = await ensureThread.mutateAsync(reservationId);
        setTripThreadId(tid);
      }
      try {
        await sendMessage.mutateAsync({ tripThreadId: tid, body });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          const fresh = await ensureThread.mutateAsync(reservationId);
          setTripThreadId(fresh);
          await sendMessage.mutateAsync({ tripThreadId: fresh, body });
        } else {
          throw err;
        }
      }
      setDraft("");
    } catch {
      setSendError(true);
    }
  };

  return (
    <section className={cn("min-w-0 flex-1 flex-col", className)}>
      {/* Header — group name + participant summary + invite */}
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
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0 text-[#ead27e]/70" />
            <span className="truncate font-semibold text-white">{conversation.name}</span>
          </div>
          <div className="truncate text-xs text-white/50">
            {conversation.participantCount} deltakere
            {conversation.participantNames && conversation.participantNames.length > 0
              ? ` · ${conversation.participantNames.join(", ")}`
              : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="flex shrink-0 items-center gap-1.5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-[#ead27e]/40 hover:text-[#ead27e]"
        >
          <UserPlus className="size-3.5" />
          <span className="hidden sm:inline">Inviter</span>
        </button>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {isLoading && tripThreadId != null ? (
          <MessagesSkeleton />
        ) : !messages?.length ? (
          <p className="pt-10 text-center text-sm text-white/40">
            Ingen meldinger ennå. Send den første meldingen til reisefølget.
          </p>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                Turfølget
              </span>
            </div>
            {messages.map((m) => {
              const mine = m.senderId === myId && m.senderRole === myRole;
              const senderLabel = m.senderRole === "skipper" ? "Skipper" : `Gjest #${m.senderId}`;
              return (
                <MessageBubble key={m.id} message={m} mine={mine} senderLabel={senderLabel} />
              );
            })}
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
        <form ref={formRef} onSubmit={send} className="border-t border-white/5 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              rows={1}
              placeholder="Skriv til reisefølget …"
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

      {inviteOpen && (
        <InviteDialog reservationCode={reservationCode} onClose={() => setInviteOpen(false)} />
      )}
    </section>
  );
}

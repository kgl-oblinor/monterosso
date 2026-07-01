import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Anchor } from "@/components/icons";
import {
  useAdminSupportMessages,
  useOpenSupportThread,
  useSendAdminSupportMessage,
} from "../api/hooks";
import type { Skipper } from "../api/types";
import { Initials } from "./AdminUI";

function parseUtc(s: string): Date {
  return new Date(s.replace(" ", "T") + "Z");
}
function clock(s: string): string {
  return parseUtc(s).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

/** Admin's direct line to a skipper (support/coordination). Opens/creates the support thread,
 *  polls messages, and lets Kristian post as the platform admin. Admin messages sit on the
 *  right (ink bubble); the skipper's replies on the left. Backed by /admin/…/support. */
export function AdminSkipperChat({ skipper, onBack }: { skipper: Skipper; onBack: () => void }) {
  const { data: thread, isLoading: opening } = useOpenSupportThread(skipper.id);
  const threadId = thread?.id ?? null;
  const { data, isLoading } = useAdminSupportMessages(threadId);
  const sendMessage = useSendAdminSupportMessage();

  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const skipperName = skipper.name || skipper.boat_name || `Skipper #${skipper.id}`;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [data?.messages]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [draft]);

  const WORD_LIMIT = 500;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const tooLong = wordCount > WORD_LIMIT;
  const sending = sendMessage.isPending;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending || tooLong || threadId == null) return;
    setSendError(false);
    try {
      await sendMessage.mutateAsync({ threadId, body });
      setDraft("");
    } catch {
      setSendError(true);
    }
  };

  return (
    <div className="flex h-[72vh] flex-col overflow-hidden rounded-card border border-hairline bg-white shadow-soft">
      <header className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex h-8 items-center gap-1 rounded-pill border border-hairline px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-black/[0.04]"
        >
          ← Tilbake
        </button>
        <Initials name={skipperName} fallback="?" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{skipperName}</div>
          <div className="flex items-center gap-1 text-xs text-ink-muted">
            <Anchor className="size-3.5 shrink-0 text-gold" /> Support · direktemelding
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {opening || (isLoading && threadId != null) ? (
          <div className="flex justify-center pt-8 text-ink-muted">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : !data?.messages.length ? (
          <p className="pt-10 text-center text-sm text-ink-muted">
            Ingen meldinger ennå. Send den første meldingen til {skipperName}.
          </p>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="rounded-full bg-surface px-3 py-1 text-xs text-ink-muted">Meldinger</span>
            </div>
            {data.messages.map((m) => {
              const mine = m.senderRole === "admin";
              return (
                <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                  <span className="mb-1 px-1 text-[11px] text-ink-muted">
                    {mine ? "Support" : skipperName}
                  </span>
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm md:max-w-[72%]",
                      mine ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-surface text-ink"
                    )}
                  >
                    {m.body}
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-ink-muted">{clock(m.createdAt)}</span>
                </div>
              );
            })}
          </>
        )}
        <div ref={endRef} />
      </div>

      <form ref={formRef} onSubmit={send} className="border-t border-hairline px-4 py-3">
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
            placeholder={`Skriv til ${skipperName} …`}
            aria-label="Skriv en melding"
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-input border border-hairline bg-white px-4 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send melding"
            disabled={!draft.trim() || sending || tooLong || threadId == null}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {sending ? <Loader2 className="size-5 animate-spin" /> : <SendHorizontal className="size-5" />}
          </button>
        </div>
        {sendError && (
          <p role="alert" className="mt-1.5 px-1 text-xs text-red-700">
            Meldingen ble ikke sendt. Prøv igjen.
          </p>
        )}
        {wordCount >= WORD_LIMIT * 0.8 && (
          <p
            className={cn(
              "mt-1.5 px-1 text-right text-xs tabular-nums",
              tooLong ? "text-red-700" : "text-ink-muted"
            )}
          >
            {wordCount} / {WORD_LIMIT}
          </p>
        )}
      </form>
    </div>
  );
}

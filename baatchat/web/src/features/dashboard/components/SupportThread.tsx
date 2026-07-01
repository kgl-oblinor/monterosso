import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, SendHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { useAuthStore } from "@/features/auth/store";
import { Anchor } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { MessageBubble, MessagesSkeleton } from "./ChatThread";
import { useSupportMessages, useSendSupportMessage, type Conversation } from "../api/threads";

/** The skipper's support pane: a direct line to the platform admin (Kristian). Mirrors
 *  ChatThread's poll + composer, but addresses the support API. The thread always exists
 *  server-side, so `adminThreadId` is present — no lazy creation needed here. Admin messages
 *  are labelled "Support"; the skipper's own replies sit on the right. */
export function SupportThread({
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
  const t = useT();
  const myRole = useAuthStore((s) => s.user?.role ?? null);
  const threadId = conversation.adminThreadId as number;
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const sendMessage = useSendSupportMessage();
  const { data: messages, isLoading } = useSupportMessages(threadId);

  useEffect(() => {
    setDraft("");
    setSendError(false);
  }, [threadId]);

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
  const sending = sendMessage.isPending;

  const WORD_LIMIT = 500;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const tooLong = wordCount > WORD_LIMIT;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending || tooLong) return;
    setSendError(false);
    try {
      await sendMessage.mutateAsync({ threadId, body });
      setDraft("");
    } catch {
      setSendError(true);
    }
  };

  return (
    <section className={cn("min-w-0 flex-1 flex-col", className)}>
      {/* Header */}
      <header className="glass sticky top-0 z-10 flex items-center gap-3 border-b border-hairline px-4 py-3 md:px-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t("nav.closeMenu")}
            className="-ml-1 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink md:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <Avatar initials="S" className="bg-gold/20 text-gold" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Anchor className="size-3.5 shrink-0 text-gold" />
            <span className="truncate font-semibold text-ink">{t("chat.support.title")}</span>
          </div>
          <div className="truncate text-xs text-ink-muted">{t("chat.support.subtitle")}</div>
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {isLoading ? (
          <MessagesSkeleton />
        ) : !messages?.length ? (
          <p className="pt-10 text-center text-sm text-ink-muted">{t("chat.support.empty")}</p>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="rounded-pill bg-surface px-3 py-1 text-xs text-ink-muted">
                {t("chat.support.title")}
              </span>
            </div>
            {messages.map((m) => {
              const mine = m.senderId === myId && m.senderRole === myRole;
              const senderLabel = m.senderRole === "admin" ? t("chat.support.admin") : null;
              return <MessageBubble key={m.id} message={m} mine={mine} senderLabel={senderLabel} />;
            })}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      {locked ? (
        <div className="border-t border-hairline px-4 py-4 text-center text-sm text-ink-muted">
          {t("chat.support.locked")}
        </div>
      ) : (
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
              placeholder={t("chat.support.placeholder")}
              aria-label={t("chat.support.placeholder")}
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-input border border-hairline bg-surface px-4 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              aria-label={t("chat.support.placeholder")}
              disabled={!draft.trim() || sending || tooLong}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <SendHorizontal className="size-5" />
              )}
            </button>
          </div>
          {sendError && (
            <p role="alert" className="mt-1.5 px-1 text-xs text-destructive">
              {t("chat.support.sendError")}
            </p>
          )}
          {wordCount >= WORD_LIMIT * 0.8 && (
            <p
              className={cn(
                "mt-1.5 px-1 text-right text-xs tabular-nums",
                tooLong ? "text-destructive" : "text-ink-muted"
              )}
            >
              {wordCount} / {WORD_LIMIT}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

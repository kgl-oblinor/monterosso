import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { Conversation } from "../api/threads";

interface ConversationsPanelProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (contactId: number) => void;
  label: string;
  className?: string;
}

export function ConversationsPanel({
  conversations,
  selectedId,
  onSelect,
  label,
  className,
}: ConversationsPanelProps) {
  const [query, setQuery] = useState("");
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  // Conversations with a message bubble to the top (already sorted newest-first upstream);
  // everyone else stays in the plain contact list below.
  const active = filtered.filter((c) => c.lastMessageAt);
  const rest = filtered.filter((c) => !c.lastMessageAt);

  return (
    <aside
      className={cn(
        // Mobile: fill the space left of the icon rail (flex-1). md+: fixed 320px column.
        "min-w-0 flex-1 flex-col border-r border-white/5 md:w-[320px] md:flex-none",
        className
      )}
    >
      <div className="px-4 pb-3 pt-5">
        <h1 className="mb-4 text-xl font-bold">Chat</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk i samtaler"
            aria-label="Søk i samtaler"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-teal-400/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-white/40">
            Ingen kontakter funnet.
          </p>
        )}

        {/* Active conversations first, newest at the top (sorted upstream by lastMessageAt). */}
        {active.length > 0 && (
          <>
            <SectionLabel>Samtaler</SectionLabel>
            <ul className="space-y-0.5">
              {active.map((c) => (
                <li key={c.contactId}>
                  <ConversationRow
                    conversation={c}
                    selected={c.contactId === selectedId}
                    onClick={() => onSelect(c.contactId)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {/* All remaining contacts (no conversation yet), alphabetical. */}
        {rest.length > 0 && (
          <>
            <SectionLabel>{label}</SectionLabel>
            <ul className="space-y-0.5">
              {rest.map((c) => (
                <li key={c.contactId}>
                  <ConversationRow
                    conversation={c}
                    selected={c.contactId === selectedId}
                    onClick={() => onSelect(c.contactId)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-white/40">
      {children}
    </p>
  );
}

function ConversationRow({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.04]",
        selected &&
          "bg-teal-500/10 ring-1 ring-inset ring-teal-500/20 hover:bg-teal-500/10"
      )}
    >
      <Avatar initials={conversation.initials} className="size-12 text-base" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-white">
            {conversation.name}
          </span>
          <span className="shrink-0 text-xs text-white/40">{conversation.timeLabel}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              conversation.unread > 0
                ? "font-medium text-white"
                : conversation.preview
                  ? "text-white/55"
                  : "italic text-white/30"
            )}
          >
            {conversation.preview || "Ingen meldinger ennå"}
          </span>
          {conversation.unread > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[11px] font-semibold text-[#04231d]">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

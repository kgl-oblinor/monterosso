import { useState } from "react";
import { Search, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { Conversation } from "../api/threads";

interface ConversationsPanelProps {
  conversations: Conversation[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  label: string;
  className?: string;
}

export function ConversationsPanel({
  conversations,
  selectedKey,
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
      <div className="px-4 pb-3 pt-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Chat</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk i samtaler"
            aria-label="Søk i samtaler"
            className="h-11 w-full rounded-full border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#ead27e]/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 &&
          (conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-white/70">Ingen samtaler ennå</p>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Når en reservasjon kobles til kontoen din, dukker den andre parten opp her –
                klar til å chatte.
              </p>
            </div>
          ) : (
            <p className="px-2 py-8 text-center text-sm text-white/40">
              Ingen kontakter funnet.
            </p>
          ))}

        {/* Active conversations first, newest at the top (sorted upstream by lastMessageAt). */}
        {active.length > 0 && (
          <>
            <SectionLabel>Samtaler</SectionLabel>
            <ul className="space-y-0.5">
              {active.map((c) => (
                <li key={c.key}>
                  <ConversationRow
                    conversation={c}
                    selected={c.key === selectedKey}
                    onClick={() => onSelect(c.key)}
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
                <li key={c.key}>
                  <ConversationRow
                    conversation={c}
                    selected={c.key === selectedKey}
                    onClick={() => onSelect(c.key)}
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
          "bg-[#ead27e]/10 ring-1 ring-inset ring-[#ead27e]/20 hover:bg-[#ead27e]/10"
      )}
    >
      <Avatar initials={conversation.initials} className="size-12 text-base" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            {conversation.kind === "group" && (
              <Users className="size-3.5 shrink-0 text-[#ead27e]/70" />
            )}
            <span className="truncate text-[15px] font-semibold text-white">
              {conversation.name}
            </span>
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
            {conversation.preview ||
              (conversation.kind === "group" ? conversation.subtitle : "Ingen meldinger ennå")}
          </span>
          {conversation.unread > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ead27e] text-[11px] font-semibold text-[#07182a]">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

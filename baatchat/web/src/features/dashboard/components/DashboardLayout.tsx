import { useEffect, useState } from "react";

import { useAuthStore } from "@/features/auth/store";
import { useConversations } from "../api/threads";
import { DEFAULT_SECTION, type SectionKey } from "../sections";
import { previewSection } from "@/app/preview";
import { IconRail } from "./IconRail";
import { ConversationsPanel } from "./ConversationsPanel";
import { ChatThread } from "./ChatThread";
import { GroupThread } from "./GroupThread";
import { ChatThreadSkeleton, ConversationsPanelSkeleton } from "./ChatSkeletons";
import { SectionView } from "./SectionViews";

/** Authenticated chat shell: icon rail · conversations · active thread.
 *  Same UI for skipper and customer — only the data (who you can chat with) differs.
 *
 *  Responsive: at md+ the conversations list and the thread sit side by side. On smaller
 *  screens only one shows at a time — the list, or the thread (with a back button). */
export function DashboardLayout() {
  const myId = useAuthStore((s) => s.user?.id ?? null);
  const myRole = useAuthStore((s) => s.user?.role);
  // The contacts list shows the *other* party: a customer sees skippers,
  // a skipper sees customers.
  const contactsLabel =
    myRole === "customer" ? "Skippere" : myRole === "skipper" ? "Kunder" : "Kontakter";
  const { conversations, isLoading, isError } = useConversations();
  // Which top-level section is shown. On sign-in everyone lands on the calm Hjem overview
  // (unless the flow-overview board deep-links a section via ?section=).
  const [section, setSection] = useState<SectionKey>(() => previewSection() ?? DEFAULT_SECTION);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // Mobile-only: which pane is visible. Ignored at md+ (both always show).
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  // Select the first conversation once data loads (for the md+ side-by-side view).
  useEffect(() => {
    if (selectedKey == null && conversations.length) setSelectedKey(conversations[0].key);
  }, [conversations, selectedKey]);

  const selected = conversations.find((c) => c.key === selectedKey) ?? null;

  const openConversation = (key: string) => {
    setSelectedKey(key);
    setMobileView("thread");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-page text-ink">
      <IconRail active={section} onSelect={setSection} />

      {section !== "chat" ? (
        <SectionView section={section} onNavigate={setSection} />
      ) : isLoading ? (
        <>
          <ConversationsPanelSkeleton className="flex" />
          <ChatThreadSkeleton className="hidden md:flex" />
        </>
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[#b04a3a]">
          Kunne ikke laste samtaler.
        </div>
      ) : (
        <>
          <ConversationsPanel
            conversations={conversations}
            selectedKey={selectedKey}
            onSelect={openConversation}
            label={contactsLabel}
            className={mobileView === "thread" ? "hidden md:flex" : "flex"}
          />
          {selected ? (
            selected.kind === "group" ? (
              <GroupThread
                key={selected.key}
                conversation={selected}
                myId={myId}
                onBack={() => setMobileView("list")}
                className={mobileView === "list" ? "hidden md:flex" : "flex"}
              />
            ) : (
              <ChatThread
                key={selected.key}
                conversation={selected}
                myId={myId}
                onBack={() => setMobileView("list")}
                className={mobileView === "list" ? "hidden md:flex" : "flex"}
              />
            )
          ) : (
            <div className="hidden flex-1 items-center justify-center text-sm text-ink-muted md:flex">
              {conversations.length
                ? "Velg en samtale for å komme i gang."
                : "Du har ingen kontakter å chatte med ennå."}
            </div>
          )}
        </>
      )}
    </div>
  );
}

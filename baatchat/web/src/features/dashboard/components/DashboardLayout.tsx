import { useEffect, useState } from "react";

import { useAuthStore } from "@/features/auth/store";
import { useConversations } from "../api/threads";
import { IconRail } from "./IconRail";
import { ConversationsPanel } from "./ConversationsPanel";
import { ChatThread } from "./ChatThread";
import { ChatThreadSkeleton, ConversationsPanelSkeleton } from "./ChatSkeletons";

/** Authenticated chat shell: icon rail · conversations · active thread.
 *  Same UI for loaner and investor — only the data (who you can chat with) differs.
 *
 *  Responsive: at md+ the conversations list and the thread sit side by side. On smaller
 *  screens only one shows at a time — the list, or the thread (with a back button). */
export function DashboardLayout() {
  const myId = useAuthStore((s) => s.user?.id ?? null);
  const myRole = useAuthStore((s) => s.user?.role);
  // The contacts list shows the *other* party: an investor sees borrowers (låntakere),
  // a loaner sees lenders (långivere).
  const contactsLabel =
    myRole === "investor" ? "Låntakere" : myRole === "loaner" ? "Långivere" : "Kontakter";
  const { conversations, isLoading, isError } = useConversations();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Mobile-only: which pane is visible. Ignored at md+ (both always show).
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  // Select the first conversation once data loads (for the md+ side-by-side view).
  useEffect(() => {
    if (selectedId == null && conversations.length) setSelectedId(conversations[0].contactId);
  }, [conversations, selectedId]);

  const selected = conversations.find((c) => c.contactId === selectedId) ?? null;

  const openConversation = (contactId: number) => {
    setSelectedId(contactId);
    setMobileView("thread");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#134e4a_0%,#0a2a2e_42%,#020617_100%)] text-white">
      <IconRail />

      {isLoading ? (
        <>
          <ConversationsPanelSkeleton className="flex" />
          <ChatThreadSkeleton className="hidden md:flex" />
        </>
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center text-sm text-red-300">
          Kunne ikke laste samtaler.
        </div>
      ) : (
        <>
          <ConversationsPanel
            conversations={conversations}
            selectedId={selectedId}
            onSelect={openConversation}
            label={contactsLabel}
            className={mobileView === "thread" ? "hidden md:flex" : "flex"}
          />
          {selected ? (
            <ChatThread
              key={selected.contactId}
              conversation={selected}
              myId={myId}
              onBack={() => setMobileView("list")}
              className={mobileView === "list" ? "hidden md:flex" : "flex"}
            />
          ) : (
            <div className="hidden flex-1 items-center justify-center text-sm text-white/40 md:flex">
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

// Real chat data layer (contacts · threads · messages) backed by the Worker API.
// Polling-based: message + thread queries refetch on an interval (no WebSockets).
//
// Backend contracts (see src/worker/index.ts, chat.ts):
//   GET  /chat/contacts                       → { contacts: Contact[] }
//   GET  /chat/threads                        → { threads: ThreadSummary[] }
//   POST /chat/threads { contactId }          → { thread: { id } }
//   GET  /chat/threads/:id/messages?since=N   → { messages: ChatMessage[] }  (also marks read)
//   POST /chat/threads/:id/messages { body }  → { message: { id } }
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";

// --- backend shapes ---------------------------------------------------------

/** A party the user is eligible to chat with (derived from shared orders). */
export interface Contact {
  id: number; // loaner_id (for investors) or investor user_id (for loaners)
  role: "investor" | "loaner";
  name: string | null;
  threadId: number | null; // existing thread, if any
}

/** An existing conversation with its last-message metadata + unread count. */
export interface ThreadSummary {
  id: number;
  contactId: number;
  contactName: string | null;
  status: string; // 'active' | 'locked'
  lastMessageAt: string | null;
  preview: string | null;
  unread: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderRole: "investor" | "loaner";
  body: string;
  createdAt: string; // "YYYY-MM-DD HH:MM:SS" (UTC)
  editedAt: string | null;
}

/** Merged view model the UI renders: every contact, enriched with thread metadata. */
export interface Conversation {
  contactId: number;
  threadId: number | null;
  name: string;
  initials: string;
  subtitle: string; // role label ("Långiver" / "Investor")
  role: "investor" | "loaner";
  preview: string;
  timeLabel: string;
  unread: number;
  status: string | null;
  lastMessageAt: string | null;
}

// --- formatting helpers -----------------------------------------------------

/** D1 datetime('now') yields naive UTC ("2026-06-17 09:01:19") — parse as UTC. */
function parseUtc(s: string): Date {
  return new Date(s.replace(" ", "T") + "Z");
}

function initialsOf(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // First two words — company names almost always end in "AS", so first + last
  // would collapse most avatars to "·A". First + second reads as "PB", "VH", "AE".
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Short relative label for the conversation list ("09:48", "i går", "12.06"). */
function relativeLabel(s: string | null): string {
  if (!s) return "";
  const d = parseUtc(s);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "i går";
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

/** Clock label for a single message bubble. */
export function messageClock(s: string): string {
  return parseUtc(s).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

// A loaner is the borrower (låntaker); an investor is the lender (långiver). The label
// shown on a contact row is therefore the *contact's* role: an investor's contacts are
// loaners → "Låntaker"; a loaner's contacts are investors → "Långiver".
const roleLabel = (role: "investor" | "loaner") =>
  role === "loaner" ? "Låntaker" : "Långiver";

function fallbackName(c: Contact): string {
  if (c.name && c.name.trim()) return c.name.trim();
  return c.role === "loaner" ? `Låntaker #${c.id}` : `Långiver #${c.id}`;
}

// --- queries ----------------------------------------------------------------

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; contacts: Contact[] }>("/chat/contacts");
      return r.contacts;
    },
  });
}

export function useThreadSummaries() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; threads: ThreadSummary[] }>("/chat/threads");
      return r.threads;
    },
    refetchInterval: 8000, // poll the conversation list for new activity / unread
  });
}

/** Merge contacts + thread summaries into the conversation list the UI renders.
 *  Conversations with recent activity sort to the top; the rest go alphabetically. */
export function useConversations() {
  const contacts = useContacts();
  const summaries = useThreadSummaries();

  const byContact = new Map<number, ThreadSummary>();
  for (const s of summaries.data ?? []) byContact.set(s.contactId, s);

  const conversations: Conversation[] = (contacts.data ?? []).map((c) => {
    const s = byContact.get(c.id);
    return {
      contactId: c.id,
      threadId: c.threadId ?? s?.id ?? null,
      name: fallbackName(c),
      initials: initialsOf(c.name),
      subtitle: roleLabel(c.role),
      role: c.role,
      preview: s?.preview ?? "",
      timeLabel: relativeLabel(s?.lastMessageAt ?? null),
      unread: s?.unread ?? 0,
      status: s?.status ?? null,
      lastMessageAt: s?.lastMessageAt ?? null,
    };
  });

  conversations.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) return a.lastMessageAt < b.lastMessageAt ? 1 : -1;
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return a.name.localeCompare(b.name, "nb-NO");
  });

  return {
    conversations,
    isLoading: contacts.isLoading || summaries.isLoading,
    isError: contacts.isError,
  };
}

export interface ThreadLoan {
  loanId: number;
  address: string | null;
  amount: number | null;
}

/** Loans a conversation concerns — the contact's loans the user is tied to via orders.
 *  Keyed by contact, so it's available immediately on selecting a conversation. */
export function useContactLoans(contactId: number | null) {
  return useQuery({
    queryKey: ["contactLoans", contactId],
    enabled: contactId != null,
    staleTime: 60_000, // loan set rarely changes mid-conversation
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; loans: ThreadLoan[] }>(
        `/chat/contacts/${contactId}/loans`
      );
      return r.loans;
    },
  });
}

export function formatAmount(n: number | null): string {
  if (n == null) return "";
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export function useMessages(threadId: number | null) {
  return useQuery({
    queryKey: ["messages", threadId],
    enabled: threadId != null,
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; messages: ChatMessage[] }>(
        `/chat/threads/${threadId}/messages?since=0`
      );
      return r.messages;
    },
    refetchInterval: 4000, // poll the open conversation for new messages
  });
}

// --- mutations --------------------------------------------------------------

/** Open (or fetch) the thread with a contact; returns the thread id. */
export function useEnsureThread() {
  return useMutation({
    mutationFn: async (contactId: number) => {
      const r = await apiClient.post<{ ok: true; thread: { id: number } }>("/chat/threads", {
        contactId,
      });
      return r.thread.id;
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, body }: { threadId: number; body: string }) => {
      const r = await apiClient.post<{ ok: true; message: { id: number } }>(
        `/chat/threads/${threadId}/messages`,
        { body }
      );
      return r.message.id;
    },
    onSuccess: (_id, { threadId }) => {
      qc.invalidateQueries({ queryKey: ["messages", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

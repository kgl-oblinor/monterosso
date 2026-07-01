// Real chat data layer (contacts · threads · messages) backed by the Worker API.
// Polling-based: message + thread queries refetch on an interval (no WebSockets).
//
// Backend contracts (see src/worker/index.ts, chat.ts):
//   GET  /chat/contacts                            → { contacts: Contact[] }
//   GET  /chat/threads                             → { threads: ThreadSummary[] }
//   POST /chat/threads { contactId }               → { thread: { id } }
//   GET  /chat/threads/:id/messages?since=N        → { messages: ChatMessage[] }  (also marks read)
//   POST /chat/threads/:id/messages { body }       → { message: { id } }
//   GET  /chat/contacts/:id/reservations           → { reservations: Reservation[] }
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import { useTripConversations, type TripConversation } from "./group";

// --- backend shapes ---------------------------------------------------------

/** A party the user is eligible to chat with (derived from shared reservations). */
export interface Contact {
  id: number; // skipper_id (for customers) or customer_id (for skippers)
  role: "skipper" | "customer";
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
  senderRole: "skipper" | "customer";
  body: string;
  createdAt: string; // "YYYY-MM-DD HH:MM:SS" (UTC)
  editedAt: string | null;
}

/** Merged view model the UI renders. A conversation is EITHER a 1-1 "direct" chat (customer↔
 *  skipper) or a "group" trip chat ("turfølget" — all reservation members + the skipper). The
 *  UI keys rows by `key` so the two kinds can live in one list without id collisions. */
export interface Conversation {
  key: string; // stable list key: "d:<contactId>" or "g:<reservationId>"
  kind: "direct" | "group";
  name: string;
  initials: string;
  subtitle: string; // role label ("Skipper" / "Kunde") or participant summary for groups
  preview: string;
  timeLabel: string;
  unread: number;
  status: string | null;
  lastMessageAt: string | null;

  // direct only
  contactId?: number;
  threadId?: number | null;
  role?: "skipper" | "customer";

  // group only
  reservationId?: number;
  reservationCode?: string;
  tripThreadId?: number | null;
  participantCount?: number;
  participantNames?: string[];
}

// --- formatting helpers -----------------------------------------------------

// Locale seam: the date/relative-time formatters below accept an optional BCP-47 locale and
// default to DEFAULT_LOCALE. When the shared i18n module lands (src/i18n with formatDate/
// formatRelative(locale) + useLocale()), callers can thread the active locale through, or these
// can delegate to it — until then, no more hardcoded 'nb-NO'.
const DEFAULT_LOCALE = "en-GB";

/** D1 datetime('now') yields naive UTC ("2026-06-17 09:01:19") — parse as UTC. */
function parseUtc(s: string): Date {
  return new Date(s.replace(" ", "T") + "Z");
}

function initialsOf(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Short relative label for the conversation list ("09:48", "i går", "12.06"). */
function relativeLabel(s: string | null, locale: string = DEFAULT_LOCALE): string {
  if (!s) return "";
  const d = parseUtc(s);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  // TODO(i18n): "i går" is Norwegian; the shared formatRelative(locale) will localize this word.
  if (d.toDateString() === yesterday.toDateString()) return "i går";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
}

/** Clock label for a single message bubble. */
export function messageClock(s: string, locale: string = DEFAULT_LOCALE): string {
  return parseUtc(s).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

// The label shown on a contact row is the *contact's* role: a customer's contacts are
// skippers → "Skipper"; a skipper's contacts are customers → "Kunde".
const roleLabel = (role: "skipper" | "customer") =>
  role === "skipper" ? "Skipper" : "Kunde";

function fallbackName(c: Contact): string {
  if (c.name && c.name.trim()) return c.name.trim();
  return c.role === "skipper" ? `Skipper #${c.id}` : `Kunde #${c.id}`;
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

/** A group trip's display name: the trip code + a short participant summary. */
function groupName(t: TripConversation): string {
  return t.reservationCode;
}

/** "Anna, Per + skipper" style summary line for a group thread. */
function groupSubtitle(t: TripConversation): string {
  const n = t.participantCount;
  const names = t.participantNames.filter(Boolean);
  if (names.length === 0) return `${n} deltakere`;
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

/** Merge direct contacts + thread summaries AND group trip threads into one conversation list.
 *  Conversations with recent activity sort to the top; the rest go alphabetically. */
export function useConversations() {
  const contacts = useContacts();
  const summaries = useThreadSummaries();
  const trips = useTripConversations();

  const byContact = new Map<number, ThreadSummary>();
  for (const s of summaries.data ?? []) byContact.set(s.contactId, s);

  const direct: Conversation[] = (contacts.data ?? []).map((c) => {
    const s = byContact.get(c.id);
    return {
      key: `d:${c.id}`,
      kind: "direct" as const,
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

  const group: Conversation[] = (trips.data ?? []).map((t) => ({
    key: `g:${t.reservationId}`,
    kind: "group" as const,
    reservationId: t.reservationId,
    reservationCode: t.reservationCode,
    tripThreadId: t.tripThreadId,
    participantCount: t.participantCount,
    participantNames: t.participantNames,
    name: groupName(t),
    initials: initialsOf(t.reservationCode),
    subtitle: groupSubtitle(t),
    preview: t.preview ?? "",
    timeLabel: relativeLabel(t.lastMessageAt),
    unread: t.unread,
    status: t.status,
    lastMessageAt: t.lastMessageAt,
  }));

  const conversations = [...group, ...direct];
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

export interface Reservation {
  code: string;
  tripDate: string | null;
  guests: number | null;
  status: string;
}

/** Reservations a conversation concerns — the trips the user shares with this contact.
 *  Keyed by contact, so it's available immediately on selecting a conversation. */
export function useContactReservations(contactId: number | null) {
  return useQuery({
    queryKey: ["contactReservations", contactId],
    enabled: contactId != null,
    staleTime: 60_000, // reservation set rarely changes mid-conversation
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; reservations: Reservation[] }>(
        `/chat/contacts/${contactId}/reservations`
      );
      return r.reservations;
    },
  });
}

/** Pretty trip-date label, e.g. "21.06.2025". Falls back to the raw value. */
export function formatTripDate(s: string | null, locale: string = DEFAULT_LOCALE): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** A trip in the "Turer" section. For a customer `contactName` is the skipper/boat;
 *  for a skipper it's the customer ("who's aboard"). */
export interface MyReservation {
  code: string;
  tripDate: string | null;
  guests: number | null;
  status: string;
  contactName: string | null;
}

/** All of the logged-in user's reservations. The Worker filters by role (customer vs
 *  skipper) using the session — same endpoint, different data. */
export function useMyReservations() {
  return useQuery({
    queryKey: ["myReservations"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; reservations: MyReservation[] }>(
        "/chat/me/reservations"
      );
      return r.reservations;
    },
  });
}

/** Confirm ('booked') or decline ('cancelled') an incoming booking request (skipper only).
 *  The Worker guards ownership + the 'requested' transition; on success we invalidate the
 *  reservations list so the row's status refreshes. Wire "Confirm" → status 'booked' and
 *  "Decline" → status 'cancelled'. */
export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, status }: { code: string; status: "booked" | "cancelled" }) => {
      const r = await apiClient.patch<{ ok: true; reservation: MyReservation }>(
        `/chat/reservations/${code}/status`,
        { status }
      );
      return r.reservation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myReservations"] });
    },
  });
}

// --- profile (the logged-in user's own contact details) --------------------

/** The user's own editable contact details. */
export interface MyProfile {
  name: string | null;
  email: string;
  phone: string | null;
}

/** The fields a profile update may change (any subset). */
export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; profile: MyProfile }>("/chat/me/profile");
      return r.profile;
    },
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileUpdate) => {
      const r = await apiClient.put<{ ok: true; profile: MyProfile }>("/chat/me/profile", input);
      return r.profile;
    },
    onSuccess: (profile) => {
      qc.setQueryData(["myProfile"], profile);
    },
  });
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

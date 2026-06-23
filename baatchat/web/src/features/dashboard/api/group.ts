// Group chat + invites ("turfølget") data layer, backed by the Worker.
//
// Backend contracts (see src/worker/index.ts, group.ts):
//   GET  /chat/invite/trips                         → { trips: InvitableTrip[] }
//   POST /chat/invite { reservationCode, email?, phone? } → { invite: { token, link, reservationCode } }
//   GET  /chat/trip-threads                         → { trips: TripConversation[] }
//   POST /chat/trip-threads { reservationId }       → { thread: { id } }
//   GET  /chat/trip-threads/:id/messages?since=N    → { messages: ChatMessage[] }
//   POST /chat/trip-threads/:id/messages { body }   → { message: { id } }
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import type { ChatMessage } from "./threads";

// --- backend shapes ---------------------------------------------------------

export interface InvitableTrip {
  reservationCode: string;
  tripDate: string | null;
  memberCount: number;
}

export interface CreatedInvite {
  token: string;
  link: string;
  reservationCode: string;
}

/** A group/trip conversation the user belongs to (shared by all members + the skipper). */
export interface TripConversation {
  tripThreadId: number | null;
  reservationId: number;
  reservationCode: string;
  tripDate: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  unread: number;
  participantCount: number;
  participantNames: string[];
}

// --- queries ----------------------------------------------------------------

/** The trips the user can invite their party into. */
export function useInvitableTrips() {
  return useQuery({
    queryKey: ["invitableTrips"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; trips: InvitableTrip[] }>("/chat/invite/trips");
      return r.trips;
    },
    staleTime: 60_000,
  });
}

/** My group/trip conversations. Polls for new activity like the 1-1 list. */
export function useTripConversations() {
  return useQuery({
    queryKey: ["tripThreads"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; trips: TripConversation[] }>("/chat/trip-threads");
      return r.trips;
    },
    refetchInterval: 8000,
  });
}

export function useTripMessages(tripThreadId: number | null) {
  return useQuery({
    queryKey: ["tripMessages", tripThreadId],
    enabled: tripThreadId != null,
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; messages: ChatMessage[] }>(
        `/chat/trip-threads/${tripThreadId}/messages?since=0`
      );
      return r.messages;
    },
    refetchInterval: 4000,
  });
}

// --- mutations --------------------------------------------------------------

export function useCreateInvite() {
  return useMutation({
    mutationFn: async (input: { reservationCode: string; email?: string; phone?: string }) => {
      const r = await apiClient.post<{ ok: true; invite: CreatedInvite }>("/chat/invite", input);
      return r.invite;
    },
  });
}

/** Open (or lazily create) a group thread for a reservation; returns the trip-thread id. */
export function useEnsureTripThread() {
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const r = await apiClient.post<{ ok: true; thread: { id: number } }>("/chat/trip-threads", {
        reservationId,
      });
      return r.thread.id;
    },
  });
}

export function useSendTripMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripThreadId, body }: { tripThreadId: number; body: string }) => {
      const r = await apiClient.post<{ ok: true; message: { id: number } }>(
        `/chat/trip-threads/${tripThreadId}/messages`,
        { body }
      );
      return r.message.id;
    },
    onSuccess: (_id, { tripThreadId }) => {
      qc.invalidateQueries({ queryKey: ["tripMessages", tripThreadId] });
      qc.invalidateQueries({ queryKey: ["tripThreads"] });
    },
  });
}

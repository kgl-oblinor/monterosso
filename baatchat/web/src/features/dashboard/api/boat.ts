// Boat verification (PREMIUM, skipper-only). Two writes that back the dashboard's verify card:
//   POST /chat/me/boat-photos { url }  → { ok }        — record a boat photo/reference
//   POST /chat/me/verify-boat          → { ok, boatVerified } — verify (only sticks if a photo is fresh)
// The verified state itself is read from useMyStatus() (GET /chat/me/status), so both mutations
// invalidate ["myStatus"] to refresh the badge. Backed by the real Worker (src/worker/boat.ts).
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";

/** Record one boat photo/reference (URL). Refreshes the status so the verify card re-reads state. */
export function useAddBoatPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      await apiClient.post<{ ok: true }>("/chat/me/boat-photos", { url });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myStatus"] }),
  });
}

/** Verify the boat. The Worker rejects (400) unless a photo was uploaded within the last 24 h. */
export function useVerifyBoat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const r = await apiClient.post<{ ok: true; boatVerified: boolean }>("/chat/me/verify-boat");
      return r.boatVerified;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myStatus"] }),
  });
}

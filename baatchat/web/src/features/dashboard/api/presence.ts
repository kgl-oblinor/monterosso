// Skipper presence + live status (skipper-only). Two honest presence methods feed one status:
//   1) AUTO GPS  — usePresenceReporter() posts the browser's location while the app is open.
//   2) MANUAL    — useSetAvailable() flips the "I'm at the boat" toggle.
// useMyStatus() reads back the computed status (available / booked / away) the same way the
// public landing does. All backed by the real Worker (see src/worker/presence.ts).
//
// Backend contracts (src/worker/index.ts):
//   POST /chat/me/presence  { lat, lng }   → { ok }
//   POST /chat/me/available { available }   → { ok }
//   GET  /chat/me/status                    → { ok, status, booked, present }
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/features/auth/store";

export interface SkipperStatus {
  status: "available" | "booked" | "away";
  booked: boolean;
  present: boolean;
  /** The skipper's own manual-toggle state (their dashboard only; never public). */
  manualAvailable: boolean;
  /** PREMIUM: verified boat — a fresh (< 24 h) owner photo existed at the verification moment. */
  boatVerified: boolean;
}

/** The skipper's own live status, for the dashboard badge. Skipper-only; polls gently. */
export function useMyStatus() {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: ["myStatus"],
    enabled: role === "skipper",
    refetchInterval: 60_000,
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true } & SkipperStatus>("/chat/me/status");
      return {
        status: r.status,
        booked: r.booked,
        present: r.present,
        manualAvailable: r.manualAvailable,
        boatVerified: r.boatVerified,
      } as SkipperStatus;
    },
  });
}

/** Flip the manual "I'm at the boat · available" toggle. Refreshes the status badge. */
export function useSetAvailable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (available: boolean) => {
      await apiClient.post<{ ok: true }>("/chat/me/available", { available });
      return available;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myStatus"] }),
  });
}

const REPORT_INTERVAL_MS = 90_000; // re-report the skipper's location every ~90s while open

/** AUTO presence: while the skipper app is open, report geolocation on mount + every ~90s.
 *  Permission is asked gracefully; if denied or unavailable, we fail silently (the manual
 *  toggle is the fallback — no errors surfaced). No-op for non-skippers. Clears on unmount. */
export function usePresenceReporter() {
  const role = useAuthStore((s) => s.user?.role);
  const qc = useQueryClient();
  // Keep a stable callback ref so the interval always posts the latest position.
  const reportRef = useRef<() => void>(() => {});

  reportRef.current = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        apiClient
          .post<{ ok: true }>("/chat/me/presence", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          .then(() => qc.invalidateQueries({ queryKey: ["myStatus"] }))
          .catch(() => {}); // silent: manual toggle is the fallback
      },
      () => {}, // denied / unavailable → silent
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  };

  useEffect(() => {
    if (role !== "skipper") return;
    reportRef.current(); // report once on mount
    const id = window.setInterval(() => reportRef.current(), REPORT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [role]);
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setAuthToken } from "@/lib/apiClient";
import type { AuthUser } from "./api/types";

/** Account approval state (customers/skippers). Admins are always treated as active. */
export type AccountStatus = "pending" | "active" | "suspended";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: AccountStatus | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser, status?: AccountStatus) => void;
  setStatus: (status: AccountStatus) => void;
  logout: () => void;
}

// Small client-state store: session token + user + approval status. Persisted to
// localStorage so a refresh keeps you signed in. Token hardening comes later.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: null,
      isAuthenticated: false,
      setSession: (token, user, status) => {
        setAuthToken(token);
        set({ token, user, status: status ?? null, isAuthenticated: true });
      },
      setStatus: (status) => set({ status }),
      logout: () => {
        setAuthToken(null);
        set({ token: null, user: null, status: null, isAuthenticated: false });
      },
    }),
    {
      name: "monterosso.auth",
      partialize: (s) => ({ token: s.token, user: s.user, status: s.status }),
      // Re-prime the apiClient with the rehydrated token on page load.
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token);
          state.isAuthenticated = true;
        }
      },
    }
  )
);

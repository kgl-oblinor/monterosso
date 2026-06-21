// Centralized, typed access to build-time env. Never put secrets here — this code
// ships to the browser. Only VITE_-prefixed vars are exposed by Vite.

export const env = {
  /** Base URL of the chat backend Worker. Defaults to the workers.dev URL (the
   *  frontend is served separately). Override with VITE_API_BASE. */
  apiBase: import.meta.env.VITE_API_BASE ?? "https://monterosso-chat.workers.dev",
  /**
   * Use the in-app mock/fixture layer instead of the live API. Defaults to ON until
   * the chat/auth endpoints ship — set VITE_USE_MOCKS=false to hit the real backend.
   */
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "true") !== "false",
} as const;

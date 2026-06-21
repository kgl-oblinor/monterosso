import { QueryClient } from "@tanstack/react-query";

// Single shared client. Conservative defaults; tune per-query as real endpoints land.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

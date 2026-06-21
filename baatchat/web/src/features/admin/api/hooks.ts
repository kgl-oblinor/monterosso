import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import { adminApi } from "./adminApi";
import type {
  AdminMessage,
  AdminThread,
  DirectoryCustomer,
  DirectorySkipper,
} from "./types";

const USERS_KEY = ["admin", "users"] as const;

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: () => adminApi.listUsers() });
}

// --- full directory ---------------------------------------------------------

export function useSkipperDirectory() {
  return useQuery({
    queryKey: ["admin", "directory", "skippers"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; skippers: DirectorySkipper[] }>(
        "/admin/directory/skippers"
      );
      return r.skippers;
    },
  });
}

export function useCustomerDirectory(params: { search: string; page: number; pageSize: number }) {
  const { search, page, pageSize } = params;
  return useQuery({
    queryKey: ["admin", "directory", "customers", search, page, pageSize],
    placeholderData: keepPreviousData, // smooth paging/search — keep showing old page while loading
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: String(pageSize), offset: String(page * pageSize) });
      if (search.trim()) qs.set("search", search.trim());
      const r = await apiClient.get<{ ok: true; customers: DirectoryCustomer[]; total: number }>(
        `/admin/directory/customers?${qs}`
      );
      return { customers: r.customers, total: r.total };
    },
  });
}

// --- conversation oversight (read-only) -------------------------------------

export function useAdminThreads(params: { search: string; page: number; pageSize: number }) {
  const { search, page, pageSize } = params;
  return useQuery({
    queryKey: ["admin", "threads", search, page, pageSize],
    placeholderData: keepPreviousData,
    refetchInterval: 10000,
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: String(pageSize), offset: String(page * pageSize) });
      if (search.trim()) qs.set("search", search.trim());
      const r = await apiClient.get<{ ok: true; threads: AdminThread[]; total: number }>(
        `/admin/threads?${qs}`
      );
      return { threads: r.threads, total: r.total };
    },
  });
}

export function useAdminThreadMessages(threadId: number | null) {
  return useQuery({
    queryKey: ["admin", "threads", threadId, "messages"],
    enabled: threadId != null,
    refetchInterval: 5000,
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; thread: AdminThread; messages: AdminMessage[] }>(
        `/admin/threads/${threadId}/messages`
      );
      return r;
    },
  });
}

// --- actions ----------------------------------------------------------------

// Approve/revoke/verify touch chat_accounts; invalidate the whole "admin" tree so the
// users list, both directories, and the stats all reflect the change.
function useAccountAction(action: (id: number) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => action(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export function useApprove() {
  return useAccountAction((id) => adminApi.approve(id));
}
export function useRevoke() {
  return useAccountAction((id) => adminApi.revoke(id));
}
export function useVerifyEmail() {
  return useAccountAction((id) => adminApi.verifyEmail(id));
}

// Set/correct a skipper's on-file email (admin override so the onboarding code reaches them).
export function useSetSkipperEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      apiClient.post(`/admin/skippers/${id}/email`, { email }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "directory", "skippers"] }),
  });
}

// Same, for a customer's on-file email.
export function useSetCustomerEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      apiClient.post(`/admin/customers/${id}/email`, { email }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "directory", "customers"] }),
  });
}

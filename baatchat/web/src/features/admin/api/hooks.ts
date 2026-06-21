import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import { adminApi } from "./adminApi";
import type {
  AdminMessage,
  AdminThread,
  DirectoryInvestor,
  DirectoryLoaner,
  Recipient,
  SendEmailBody,
  SendEmailResult,
} from "./types";

const USERS_KEY = ["admin", "users"] as const;

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: () => adminApi.listUsers() });
}

// --- full directory ---------------------------------------------------------

export function useLoanerDirectory() {
  return useQuery({
    queryKey: ["admin", "directory", "loaners"],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; loaners: DirectoryLoaner[] }>(
        "/admin/directory/loaners"
      );
      return r.loaners;
    },
  });
}

export function useInvestorDirectory(params: { search: string; page: number; pageSize: number }) {
  const { search, page, pageSize } = params;
  return useQuery({
    queryKey: ["admin", "directory", "investors", search, page, pageSize],
    placeholderData: keepPreviousData, // smooth paging/search — keep showing old page while loading
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: String(pageSize), offset: String(page * pageSize) });
      if (search.trim()) qs.set("search", search.trim());
      const r = await apiClient.get<{ ok: true; investors: DirectoryInvestor[]; total: number }>(
        `/admin/directory/investors?${qs}`
      );
      return { investors: r.investors, total: r.total };
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

// Set/correct a loaner's on-file email (admin override so emailless borrowers can register).
export function useSetLoanerEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      apiClient.post(`/admin/loaners/${id}/email`, { email }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "directory", "loaners"] }),
  });
}

// Same, for an investor's on-file email.
export function useSetInvestorEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      apiClient.post(`/admin/investors/${id}/email`, { email }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "directory", "investors"] }),
  });
}

// --- broadcast email --------------------------------------------------------

/** How many recipients a whole-audience send would reach (loaners w/ loan, investors
 *  w/ order, or both). Not used for "selected" — the UI counts those locally. */
export function useAudienceCount(audience: "loaners" | "investors" | "all") {
  return useQuery({
    queryKey: ["admin", "email", "count", audience],
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; count: number }>(
        `/admin/email/audience-count?audience=${audience}`
      );
      return r.count;
    },
  });
}

/** Searchable/paginated recipient picker for the "specific recipients" mode. */
export function useRecipients(params: {
  group: "loaners" | "investors";
  search: string;
  page: number;
  pageSize: number;
  enabled?: boolean;
}) {
  const { group, search, page, pageSize, enabled = true } = params;
  return useQuery({
    queryKey: ["admin", "email", "recipients", group, search, page, pageSize],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const qs = new URLSearchParams({
        group,
        limit: String(pageSize),
        offset: String(page * pageSize),
      });
      if (search.trim()) qs.set("search", search.trim());
      const r = await apiClient.get<{ ok: true; recipients: Recipient[]; total: number }>(
        `/admin/email/recipients?${qs}`
      );
      return { recipients: r.recipients, total: r.total };
    },
  });
}

/** Send (or test-send) a broadcast. The backend returns needsConfirm:true for a real
 *  broadcast until confirm:true is passed — the UI uses that for the "are you sure" gate. */
export function useSendEmail() {
  return useMutation({
    mutationFn: (body: SendEmailBody) =>
      apiClient.post<SendEmailResult>("/admin/email/send", body),
  });
}

// --- email drafts -----------------------------------------------------------

export interface EmailDraftSummary {
  id: number;
  subject: string;
  audience: string;
  updatedAt: string;
}

const DRAFTS_KEY = ["admin", "email", "drafts"] as const;

export function useEmailDrafts() {
  return useQuery({
    queryKey: DRAFTS_KEY,
    queryFn: async () => {
      const r = await apiClient.get<{ ok: true; drafts: EmailDraftSummary[] }>("/admin/email/drafts");
      return r.drafts;
    },
  });
}

export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id?: number;
      subject: string;
      html: string;
      audience: string;
      selected?: unknown;
    }) => apiClient.post<{ ok: true; id: number }>("/admin/email/drafts", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: DRAFTS_KEY }),
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/admin/email/drafts/${id}/delete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: DRAFTS_KEY }),
  });
}

/** Fetch one full draft (subject/html/audience/selected) on demand to load into the composer. */
export async function fetchDraft(id: number) {
  const r = await apiClient.get<{
    ok: true;
    draft: { id: number; subject: string; html: string; audience: string; selected: unknown };
  }>(`/admin/email/drafts/${id}`);
  return r.draft;
}

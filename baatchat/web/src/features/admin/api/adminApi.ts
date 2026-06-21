// Admin (Kristian) management API. Calls the JWT-guarded /admin/users endpoints (the
// admin's token is attached automatically by the apiClient). Swaps to a mock when VITE_USE_MOCKS.
import { apiClient } from "@/lib/apiClient";
import { env } from "@/lib/env";
import { mockAdminApi } from "@/mocks/mockAdmin";
import type { AdminAccount } from "./types";

export interface AdminApi {
  listUsers(): Promise<AdminAccount[]>;
  approve(id: number): Promise<void>;
  revoke(id: number): Promise<void>;
  verifyEmail(id: number): Promise<void>;
}

const realAdminApi: AdminApi = {
  async listUsers() {
    const r = await apiClient.get<{ ok: true; users: AdminAccount[] }>("/admin/users");
    return r.users;
  },
  async approve(id) {
    await apiClient.post(`/admin/users/${id}/approve`);
  },
  async revoke(id) {
    await apiClient.post(`/admin/users/${id}/revoke`);
  },
  async verifyEmail(id) {
    await apiClient.post(`/admin/users/${id}/verify-email`, { verified: true });
  },
};

export const adminApi: AdminApi = env.useMocks ? mockAdminApi : realAdminApi;

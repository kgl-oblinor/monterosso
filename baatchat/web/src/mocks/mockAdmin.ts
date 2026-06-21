// In-memory mock of the admin user-management API. Mutates a module-level array so the
// table reacts to approve/revoke/verify in demo mode.
import type { AdminApi } from "@/features/admin/api/adminApi";
import type { AdminAccount } from "@/features/admin/api/types";
import { delay } from "./fixtures";

let users: AdminAccount[] = [
  {
    id: 1, partyId: 5012, email: "andrea@paolona.it", role: "skipper", name: "Andrea (Paolona)",
    emailVerified: true, status: "pending", createdAt: "2026-06-14", lastLoginAt: null,
  },
  {
    id: 2, partyId: 7781, email: "anna@example.com", role: "customer", name: "Anna Berg",
    emailVerified: true, status: "active", createdAt: "2026-06-10", lastLoginAt: "2026-06-16",
  },
  {
    id: 3, partyId: 8123, email: "luca@vernazza-boats.it", role: "skipper", name: "Luca (Vernazza)",
    emailVerified: false, status: "pending", createdAt: "2026-06-15", lastLoginAt: null,
  },
  {
    id: 4, partyId: 7790, email: "sofia@example.com", role: "customer", name: "Sofia Lie",
    emailVerified: true, status: "suspended", createdAt: "2026-05-30", lastLoginAt: "2026-06-12",
  },
];

const patch = (id: number, fields: Partial<AdminAccount>) => {
  users = users.map((u) => (u.id === id ? { ...u, ...fields } : u));
};

export const mockAdminApi: AdminApi = {
  async listUsers() {
    await delay(300);
    return [...users];
  },
  async approve(id) {
    await delay(250);
    patch(id, { status: "active" });
  },
  async revoke(id) {
    await delay(250);
    patch(id, { status: "suspended" });
  },
  async verifyEmail(id) {
    await delay(250);
    patch(id, { emailVerified: true });
  },
};

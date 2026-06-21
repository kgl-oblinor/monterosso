// In-memory mock of the admin user-management API. Mutates a module-level array so the
// table reacts to approve/revoke/verify in demo mode.
import type { AdminApi } from "@/features/admin/api/adminApi";
import type { AdminAccount } from "@/features/admin/api/types";
import { delay } from "./fixtures";

let users: AdminAccount[] = [
  {
    id: 1, oblinorId: 5012, email: "post@probolig.no", role: "loaner", name: "Pro Bolig AS",
    emailVerified: true, status: "pending", createdAt: "2026-06-14", lastLoginAt: null,
  },
  {
    id: 2, oblinorId: 7781, email: "ole@oblinor.no", role: "investor", name: "Ole Pedersen",
    emailVerified: true, status: "active", createdAt: "2026-06-10", lastLoginAt: "2026-06-16",
  },
  {
    id: 3, oblinorId: 8123, email: "mona@veienhjem.no", role: "loaner", name: "Veien Hjem AS",
    emailVerified: false, status: "pending", createdAt: "2026-06-15", lastLoginAt: null,
  },
  {
    id: 4, oblinorId: 7790, email: "siri@invest.no", role: "investor", name: "Siri Berg",
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

import { useAuthStore } from "@/features/auth/store";
import { DashboardLayout } from "./components/DashboardLayout";
import { PendingApproval } from "./PendingApproval";

export function DashboardPage() {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.user?.role);

  // Customers/skippers must be admin-approved before they can chat.
  if (role !== "admin" && status !== "active") {
    return <PendingApproval />;
  }
  return <DashboardLayout />;
}

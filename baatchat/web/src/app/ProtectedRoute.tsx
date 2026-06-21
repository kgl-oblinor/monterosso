import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store";

/**
 * Guards routes by authentication and role.
 * - Unauthenticated → /login (or /admin/login for admin areas).
 * - `requireAdmin` routes need role "admin"; non-admins are bounced to /dashboard.
 * - Admins are kept out of the chat dashboard (sent to /admin).
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  }
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  if (!requireAdmin && role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

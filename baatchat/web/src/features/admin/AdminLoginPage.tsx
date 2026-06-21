import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AdminLoginForm } from "./components/AdminLoginForm";

export function AdminLoginPage() {
  return (
    <AuthLayout subtitle={null}>
      <AdminLoginForm />
    </AuthLayout>
  );
}

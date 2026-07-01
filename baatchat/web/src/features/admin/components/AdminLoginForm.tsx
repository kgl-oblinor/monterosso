import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useT } from "@/i18n";
import { makeLoginSchema, type LoginForm as LoginValues } from "@/features/auth/schemas";
import { useAdminLogin } from "@/features/auth/api/hooks";
import { useAuthStore } from "@/features/auth/store";
import { IconInput } from "@/features/auth/components/IconInput";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthError } from "@/features/auth/components/AuthError";
import { AuthHeading } from "@/features/auth/components/AuthLayout";
import { AdminForgotFlow } from "./AdminForgotFlow";

export function AdminLoginForm() {
  const t = useT();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const login = useAdminLogin();
  const [forgot, setForgot] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(makeLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: ({ token, user }) => {
        setSession(token, user);
        navigate("/admin", { replace: true });
      },
    });
  });

  if (forgot) {
    return <AdminForgotFlow onBack={() => setForgot(false)} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthHeading title="Administrator" subtitle="Logg inn for å administrere tilgang" />

        {login.isError && <AuthError message={login.error.message} />}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <IconInput
                  icon={<Mail className="h-5 w-5" />}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("auth.field.email")}
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage className="ml-4 text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput placeholder={t("auth.field.password")} autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage className="ml-4 text-red-600" />
            </FormItem>
          )}
        />

        <div className="text-right">
          <button
            type="button"
            onClick={() => setForgot(true)}
            className="text-sm text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {t("auth.login.forgot")}
          </button>
        </div>

        <AuthButton type="submit" loading={login.isPending}>
          {t("auth.login.submit")}
        </AuthButton>
      </form>
    </Form>
  );
}

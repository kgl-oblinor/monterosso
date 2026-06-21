import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginForm, type LoginForm as LoginValues } from "../schemas";
import { useLogin } from "../api/hooks";
import { useAuthStore } from "../store";
import { IconInput } from "./IconInput";
import { PasswordInput } from "./PasswordInput";
import { AuthButton } from "./AuthButton";
import { AuthError } from "./AuthError";
import { AuthHeading } from "./AuthLayout";
import { ForgotPasswordFlow } from "./ForgotPasswordFlow";

export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [forgot, setForgot] = useState(false);

  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginForm),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: ({ token, user, status }) => {
        setSession(token, user, status);
        navigate("/dashboard", { replace: true });
      },
    });
  });

  if (forgot) {
    return <ForgotPasswordFlow onBack={() => setForgot(false)} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthHeading title="Logg inn" subtitle="Chat mellom kunder og skippere" />

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
                  placeholder="E-postadresse"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage className="ml-4 text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  placeholder="Passord"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="ml-4 text-red-400" />
            </FormItem>
          )}
        />

        <div className="text-right">
          <button
            type="button"
            onClick={() => setForgot(true)}
            className="text-sm text-white/70 underline transition-colors hover:text-white"
          >
            Glemt passord?
          </button>
        </div>

        <AuthButton type="submit" loading={login.isPending}>
          Logg inn
        </AuthButton>

        <p className="text-center text-sm text-white/70">
          Har du ikke konto?{" "}
          <Link
            to="/register"
            className="text-white underline transition-colors hover:text-white/80"
          >
            Opprett konto
          </Link>
        </p>
      </form>
    </Form>
  );
}

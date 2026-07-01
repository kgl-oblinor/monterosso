import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AtSign, Mail } from "lucide-react";

import { ApiError } from "@/lib/apiClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useT } from "@/i18n";
import {
  makeLoginSchema,
  makePasswordlessSchema,
  toPasswordlessInput,
  type LoginForm as LoginValues,
  type PasswordlessForm,
} from "../schemas";
import { useLogin, usePasswordless } from "../api/hooks";
import { useAuthStore } from "../store";
import { IconInput } from "./IconInput";
import { PasswordInput } from "./PasswordInput";
import { AuthButton } from "./AuthButton";
import { AuthError } from "./AuthError";
import { AuthHeading } from "./AuthLayout";
import { ForgotPasswordFlow } from "./ForgotPasswordFlow";

/** True when an error is the backend's "this account is secured with a password" signal. */
function isNeedsPassword(err: unknown): boolean {
  return err instanceof ApiError && (err.body as { needsPassword?: boolean })?.needsPassword === true;
}

export function LoginForm() {
  const t = useT();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  // "passwordless" is the main way in; "password" and "forgot" are quiet, optional detours.
  const [mode, setMode] = useState<"passwordless" | "password">("passwordless");
  const [forgot, setForgot] = useState(false);

  const passwordless = usePasswordless();
  const login = useLogin();

  const entryForm = useForm<PasswordlessForm>({
    resolver: zodResolver(makePasswordlessSchema(t)),
    defaultValues: { contact: "" },
  });

  const pwForm = useForm<LoginValues>({
    resolver: zodResolver(makeLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onEnter = entryForm.handleSubmit(({ contact }) => {
    passwordless.mutate(toPasswordlessInput(contact), {
      onSuccess: ({ token, user, status }) => {
        setSession(token, user, status);
        navigate("/dashboard", { replace: true });
      },
      onError: (err) => {
        // Account secured with a password → switch them to the password login, prefilled.
        if (isNeedsPassword(err)) {
          const v = toPasswordlessInput(contact);
          if (v.email) pwForm.setValue("email", v.email);
          setMode("password");
        }
      },
    });
  });

  const onPassword = pwForm.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: ({ token, user, status }) => {
        setSession(token, user, status);
        navigate("/dashboard", { replace: true });
      },
    });
  });

  const needsPasswordHint = passwordless.isError && isNeedsPassword(passwordless.error);

  if (forgot) {
    return <ForgotPasswordFlow onBack={() => setForgot(false)} />;
  }

  // --- password login (for accounts that have one) ---
  if (mode === "password") {
    return (
      <Form key="login-password" {...pwForm}>
        <form onSubmit={onPassword} className="space-y-5" noValidate>
          <AuthHeading
            title={t("auth.login.passwordTitle")}
            subtitle={t("auth.login.passwordSubtitle")}
          />

          {needsPasswordHint && (
            <p className="rounded-input border border-hairline bg-surface px-4 py-3 text-center text-sm text-ink-muted">
              {t("auth.login.securedHint")}
            </p>
          )}

          {login.isError && <AuthError message={login.error.message} />}

          <FormField
            control={pwForm.control}
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
            control={pwForm.control}
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

          <p className="text-center text-sm text-ink-muted">
            <button
              type="button"
              onClick={() => setMode("passwordless")}
              className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              {t("auth.login.backToPasswordless")}
            </button>
          </p>
        </form>
      </Form>
    );
  }

  // --- passwordless entry (the main path) ---
  return (
    <Form key="login-passwordless" {...entryForm}>
      <form onSubmit={onEnter} className="space-y-5" noValidate>
        <AuthHeading title={t("auth.login.welcome")} subtitle={t("auth.login.welcomeSubtitle")} />

        {passwordless.isError && !needsPasswordHint && (
          <AuthError message={passwordless.error.message} />
        )}

        <FormField
          control={entryForm.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <IconInput
                  icon={<AtSign className="h-5 w-5" />}
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("auth.field.contact")}
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage className="ml-4 text-red-600" />
            </FormItem>
          )}
        />

        <AuthButton type="submit" loading={passwordless.isPending}>
          {t("auth.common.continue")}
        </AuthButton>

        <p className="text-center text-sm text-ink-muted">
          {t("auth.login.hasPassword")}{" "}
          <button
            type="button"
            onClick={() => setMode("password")}
            className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {t("auth.login.withPassword")}
          </button>
        </p>
      </form>
    </Form>
  );
}

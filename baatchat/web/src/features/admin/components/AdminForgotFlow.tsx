import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { env } from "@/lib/env";
import { MOCK_OTP_CODE } from "@/mocks/fixtures";
import { useT } from "@/i18n";
import {
  makeForgotPasswordSchema,
  makeCodeSchema,
  type ForgotPasswordForm,
  type CodeForm,
} from "@/features/auth/schemas";
import { useAdminResetStart, useAdminResetVerify } from "@/features/auth/api/hooks";
import { useAuthStore } from "@/features/auth/store";
import { IconInput } from "@/features/auth/components/IconInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthError } from "@/features/auth/components/AuthError";

/** Admin recovery: enter an allow-listed admin email → receive a code → verify it and log
 *  straight in (admins share a secret, so there's no password to reset). `onBack` → login. */
export function AdminForgotFlow({ onBack }: { onBack: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [view, setView] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const start = useAdminResetStart();
  const verify = useAdminResetVerify();

  const requestForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(makeForgotPasswordSchema(t)),
    defaultValues: { email: "" },
  });
  const verifyForm = useForm<CodeForm>({
    resolver: zodResolver(makeCodeSchema(t)),
    defaultValues: { code: "" },
  });

  const onRequest = requestForm.handleSubmit(async ({ email }) => {
    const { sentTo } = await start.mutateAsync(email);
    setEmail(email);
    setSentTo(sentTo);
    setView("verify");
  });

  const onVerify = verifyForm.handleSubmit(({ code }) => {
    verify.mutate(
      { email, code },
      {
        onSuccess: ({ token, user }) => {
          setSession(token, user);
          navigate("/admin", { replace: true });
        },
      }
    );
  });

  if (view === "verify") {
    return (
      <Form key="admin-recovery-verify" {...verifyForm}>
        <form onSubmit={onVerify} className="space-y-5" noValidate>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-ink">{t("auth.verify.title")}</h2>
            <p className="text-sm text-ink-muted">
              Hvis <span className="font-semibold text-ink">{email}</span> er en
              administrator, sendte vi en 6-sifret kode dit
              {sentTo ? (
                <>
                  {" "}
                  (<span className="font-semibold text-ink">{sentTo}</span>)
                </>
              ) : null}
              . Skriv den inn for å logge inn.
            </p>
          </div>

          {env.useMocks && (
            <p className="text-center text-sm text-ink-muted">
              {t("auth.demo.hint", { code: MOCK_OTP_CODE })}
            </p>
          )}

          {verify.isError && <AuthError message={verify.error.message} />}

          <FormField
            control={verifyForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <IconInput
                    icon={<ShieldCheck className="h-5 w-5" />}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t("auth.field.code")}
                    autoComplete="one-time-code"
                    autoFocus
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    // Digits only — strip whitespace/letters, cap at 6.
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                </FormControl>
                <FormMessage className="ml-4 text-red-600" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <AuthButton type="button" variant="outline" onClick={onBack}>
              {t("auth.common.cancel")}
            </AuthButton>
            <AuthButton type="submit" loading={verify.isPending}>
              {t("auth.login.submit")}
            </AuthButton>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form key="admin-recovery-request" {...requestForm}>
      <form onSubmit={onRequest} className="space-y-5" noValidate>
        <button
          type="button"
          onClick={onBack}
          aria-label={t("auth.forgot.backToLogin")}
          className="flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          {t("auth.common.back")}
        </button>

        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold text-ink">{t("auth.forgot.requestTitle")}</h2>
          <p className="text-sm text-ink-muted">
            Oppgi administrator-e-posten din, så sender vi deg en kode for å logge inn.
          </p>
        </div>

        {start.isError && <AuthError message={start.error.message} />}

        <FormField
          control={requestForm.control}
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <AuthButton type="button" variant="outline" onClick={onBack}>
            {t("auth.common.cancel")}
          </AuthButton>
          <AuthButton type="submit" loading={start.isPending}>
            {t("auth.common.sendCode")}
          </AuthButton>
        </div>
      </form>
    </Form>
  );
}

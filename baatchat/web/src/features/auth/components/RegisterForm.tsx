import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AtSign, Mail, Phone, ShieldCheck, Ticket } from "lucide-react";

import { ApiError } from "@/lib/apiClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { env } from "@/lib/env";
import { MOCK_OTP_CODE } from "@/mocks/fixtures";
import { useT } from "@/i18n";
import {
  makeClaimStartSchema,
  makeCodePasswordSchema,
  makePasswordlessSchema,
  toPasswordlessInput,
  type ClaimStartForm,
  type CodePasswordForm,
  type PasswordlessForm,
} from "../schemas";
import { usePasswordless, useRegisterStart, useRegisterComplete } from "../api/hooks";
import { useAuthStore } from "../store";
import type { RegisterStartInput } from "../api/types";
import { IconInput } from "./IconInput";
import { PasswordInput } from "./PasswordInput";
import { AuthButton } from "./AuthButton";
import { AuthError } from "./AuthError";
import { AuthHeading } from "./AuthLayout";

/** True when an error is the backend's "this account is secured with a password" signal. */
function isNeedsPassword(err: unknown): boolean {
  return err instanceof ApiError && (err.body as { needsPassword?: boolean })?.needsPassword === true;
}

// Onboarding. The MAIN path is passwordless: write your email OR phone → Continue → straight
// in (a light customer account is created, no password, no code). Securing the account with a
// password is a calm, OPTIONAL upgrade (the "secure with a password" detour below) — it uses
// the code-verified claim flow and can also be done later from the profile.
export function RegisterForm() {
  const t = useT();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [secure, setSecure] = useState(false); // optional password-upgrade flow
  const [step, setStep] = useState<"identify" | "verify">("identify");
  const [identifier, setIdentifier] = useState<RegisterStartInput>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  const passwordless = usePasswordless();
  const start = useRegisterStart();
  const complete = useRegisterComplete();

  const entryForm = useForm<PasswordlessForm>({
    resolver: zodResolver(makePasswordlessSchema(t)),
    defaultValues: { contact: "" },
  });

  const idForm = useForm<ClaimStartForm>({
    resolver: zodResolver(makeClaimStartSchema(t)),
    defaultValues: { mode: "email", email: "", phone: "", reservationCode: "" },
  });
  const mode = idForm.watch("mode");

  const verifyForm = useForm<CodePasswordForm>({
    resolver: zodResolver(makeCodePasswordSchema(t)),
    defaultValues: { code: "", password: "" },
  });

  const onEnter = entryForm.handleSubmit(({ contact }) => {
    passwordless.mutate(toPasswordlessInput(contact), {
      onSuccess: ({ token, user, status }) => {
        setSession(token, user, status);
        navigate("/dashboard", { replace: true });
      },
    });
  });

  const onIdentify = idForm.handleSubmit((values) => {
    const id: RegisterStartInput =
      values.mode === "email"
        ? { email: values.email }
        : values.mode === "phone"
          ? { phone: values.phone }
          : { reservationCode: values.reservationCode };
    start.mutate(id, {
      onSuccess: ({ sentTo }) => {
        setIdentifier(id);
        setSentTo(sentTo);
        setStep("verify");
      },
    });
  });

  const onVerify = verifyForm.handleSubmit(({ code, password }) => {
    complete.mutate(
      { ...identifier, code, password },
      {
        onSuccess: ({ token, user, status }) => {
          setSession(token, user, status);
          navigate("/dashboard", { replace: true });
        },
      }
    );
  });

  // --- OPTIONAL: secure the account with a password (code-verified claim flow) ---
  if (secure) {
    if (step === "verify") {
      return (
        <Form key="register-verify" {...verifyForm}>
          <form onSubmit={onVerify} className="space-y-5" noValidate>
            <div className="space-y-3 text-center">
              <h2 className="text-xl font-semibold text-ink">{t("auth.verify.title")}</h2>
              <p className="text-sm text-ink-muted">{t("auth.verify.subtitle")}</p>
              {sentTo && (
                <div className="mx-auto inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface px-4 py-1.5 text-sm text-ink">
                  <Mail className="size-4 shrink-0 text-gold" />
                  {t("auth.verify.checkInbox", { email: sentTo })}
                </div>
              )}
            </div>

            {env.useMocks && (
              <p className="text-center text-sm text-ink-muted">
                {t("auth.demo.hint", { code: MOCK_OTP_CODE })}
              </p>
            )}

            {complete.isError && <AuthError message={complete.error.message} />}

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
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={verifyForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      placeholder={t("auth.field.choosePassword")}
                      autoComplete="new-password"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-600" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <AuthButton type="button" variant="outline" onClick={() => setStep("identify")}>
                {t("auth.common.back")}
              </AuthButton>
              <AuthButton type="submit" loading={complete.isPending}>
                {t("auth.verify.savePassword")}
              </AuthButton>
            </div>
          </form>
        </Form>
      );
    }

    return (
      <Form key="register-identify" {...idForm}>
        <form onSubmit={onIdentify} className="space-y-5" noValidate>
          <AuthHeading
            title={t("auth.secure.title")}
            subtitle={t("auth.secure.subtitle")}
          />

          {start.isError && <AuthError message={start.error.message} />}

          <FormField
            control={idForm.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-input border border-hairline bg-white px-5 text-base text-ink data-[placeholder]:text-ink-muted">
                      <SelectValue placeholder={t("auth.secure.methodPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">{t("auth.secure.methodEmail")}</SelectItem>
                    <SelectItem value="phone">{t("auth.secure.methodPhone")}</SelectItem>
                    <SelectItem value="reservation">{t("auth.secure.methodReservation")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="ml-4 text-red-600" />
              </FormItem>
            )}
          />

          {mode === "reservation" ? (
            <FormField
              control={idForm.control}
              name="reservationCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IconInput
                      icon={<Ticket className="h-5 w-5" />}
                      placeholder={t("auth.field.reservation")}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-600" />
                </FormItem>
              )}
            />
          ) : mode === "phone" ? (
            <FormField
              control={idForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IconInput
                      icon={<Phone className="h-5 w-5" />}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={t("auth.field.phone")}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-600" />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={idForm.control}
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
          )}

          <AuthButton type="submit" loading={start.isPending}>
            {t("auth.common.sendCode")}
          </AuthButton>

          <p className="text-center text-sm text-ink-muted">
            <button
              type="button"
              onClick={() => setSecure(false)}
              className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              {t("auth.secure.backNoPassword")}
            </button>
          </p>
        </form>
      </Form>
    );
  }

  // --- MAIN PATH: passwordless entry ---
  return (
    <Form key="register-passwordless" {...entryForm}>
      <form onSubmit={onEnter} className="space-y-5" noValidate>
        <AuthHeading title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} />

        {passwordless.isError && !isNeedsPassword(passwordless.error) && (
          <AuthError message={passwordless.error.message} />
        )}

        {passwordless.isError && isNeedsPassword(passwordless.error) && (
          <p className="rounded-input border border-hairline bg-surface px-4 py-3 text-center text-sm text-ink-muted">
              {t("auth.register.alreadyHasPassword")}{" "}
              <Link to="/login" className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80">
                {t("auth.login.withPassword")}
              </Link>
              .
            </p>
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
          {t("auth.register.secureQuestion")}{" "}
          <button
            type="button"
            onClick={() => {
              setStep("identify");
              setSecure(true);
            }}
            className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {t("auth.register.createPassword")}
          </button>
          <br />
          <span className="text-ink-muted">{t("auth.register.laterInProfile")}</span>
        </p>

        <p className="text-center text-sm text-ink-muted">
          {t("auth.register.haveAccount")}{" "}
          <Link to="/login" className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80">
            {t("auth.login.link")}
          </Link>
        </p>
      </form>
    </Form>
  );
}

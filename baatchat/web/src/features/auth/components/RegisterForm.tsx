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
import {
  claimStartForm,
  codePasswordForm,
  passwordlessForm,
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
    resolver: zodResolver(passwordlessForm),
    defaultValues: { contact: "" },
  });

  const idForm = useForm<ClaimStartForm>({
    resolver: zodResolver(claimStartForm),
    defaultValues: { mode: "email", email: "", phone: "", reservationCode: "" },
  });
  const mode = idForm.watch("mode");

  const verifyForm = useForm<CodePasswordForm>({
    resolver: zodResolver(codePasswordForm),
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
              <h2 className="text-xl font-semibold">Sjekk e-posten din</h2>
              <p className="text-sm text-white/80">
                Vi sendte en 6-sifret kode. Oppgi koden og velg et passord.
              </p>
              {sentTo && (
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white">
                  <Mail className="size-4 shrink-0 text-[#ead27e]" />
                  Sjekk innboksen til <span className="font-semibold">{sentTo}</span>
                </div>
              )}
            </div>

            {env.useMocks && (
              <p className="text-center text-sm text-white/70">
                Demo-modus — bruk kode{" "}
                <span className="font-mono font-medium text-white">{MOCK_OTP_CODE}</span>.
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
                      placeholder="6-sifret kode"
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
                  <FormMessage className="ml-4 text-red-400" />
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
                      placeholder="Velg et passord (minst 8 tegn)"
                      autoComplete="new-password"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <AuthButton type="button" variant="outline" onClick={() => setStep("identify")}>
                Tilbake
              </AuthButton>
              <AuthButton type="submit" loading={complete.isPending}>
                Lagre passord
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
            title="Sikre kontoen med passord"
            subtitle="Valgfritt. Vi sender en kode til e-posten vi har registrert."
          />

          {start.isError && <AuthError message={start.error.message} />}

          <FormField
            control={idForm.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-full border-2 border-white bg-white px-5 text-base text-black shadow-lg data-[placeholder]:text-black/60">
                      <SelectValue placeholder="Velg metode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Med e-post</SelectItem>
                    <SelectItem value="phone">Med telefon / WhatsApp</SelectItem>
                    <SelectItem value="reservation">Med reservasjonskode</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="ml-4 text-red-400" />
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
                      placeholder="Reservasjonskode (f.eks. MT-210625-2)"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-400" />
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
                      placeholder="Telefon / WhatsApp (f.eks. +47 …)"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-400" />
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
                      placeholder="E-postadresse"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4 text-red-400" />
                </FormItem>
              )}
            />
          )}

          <AuthButton type="submit" loading={start.isPending}>
            Send kode
          </AuthButton>

          <p className="text-center text-sm text-white/70">
            <button
              type="button"
              onClick={() => setSecure(false)}
              className="text-white underline transition-colors hover:text-white/80"
            >
              Tilbake — kom rett inn uten passord
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
        <AuthHeading title="Kom i gang" subtitle="Skriv e-post eller telefon, så er du inne" />

        {passwordless.isError && !isNeedsPassword(passwordless.error) && (
          <AuthError message={passwordless.error.message} />
        )}

        {passwordless.isError && isNeedsPassword(passwordless.error) && (
          <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-white/80">
              Du har allerede en konto med passord.{" "}
              <Link to="/login" className="text-white underline">
                Logg inn med passord
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
                  placeholder="E-post eller telefon"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage className="ml-4 text-red-400" />
            </FormItem>
          )}
        />

        <AuthButton type="submit" loading={passwordless.isPending}>
          Continue
        </AuthButton>

        <p className="text-center text-sm text-white/70">
          Vil du sikre kontoen?{" "}
          <button
            type="button"
            onClick={() => {
              setStep("identify");
              setSecure(true);
            }}
            className="text-white underline transition-colors hover:text-white/80"
          >
            Lag et passord
          </button>
          <br />
          <span className="text-white/50">Du kan også gjøre det senere i profilen.</span>
        </p>

        <p className="text-center text-sm text-white/70">
          Har du allerede konto?{" "}
          <Link to="/login" className="text-white underline transition-colors hover:text-white/80">
            Logg inn
          </Link>
        </p>
      </form>
    </Form>
  );
}

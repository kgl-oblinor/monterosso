import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Mail, ShieldCheck } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { env } from "@/lib/env";
import { MOCK_OTP_CODE } from "@/mocks/fixtures";
import {
  forgotPasswordForm,
  codePasswordForm,
  type ForgotPasswordForm,
  type CodePasswordForm,
} from "../schemas";
import { useRegisterStart, useRegisterComplete } from "../api/hooks";
import { IconInput } from "./IconInput";
import { PasswordInput } from "./PasswordInput";
import { AuthButton } from "./AuthButton";
import { AuthError } from "./AuthError";

type View = "request" | "reset" | "done";

/** Forgot-password = re-claim the account by email: send a code → enter code + new
 *  password (register/complete overwrites the password). `onBack` returns to login. */
export function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("request");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const start = useRegisterStart();
  const complete = useRegisterComplete();

  const requestForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordForm),
    defaultValues: { email: "" },
  });
  const resetForm = useForm<CodePasswordForm>({
    resolver: zodResolver(codePasswordForm),
    defaultValues: { code: "", password: "" },
  });

  const onRequest = requestForm.handleSubmit(async ({ email }) => {
    const { sentTo } = await start.mutateAsync({ email });
    setEmail(email);
    setSentTo(sentTo);
    setView("reset");
  });

  const onReset = resetForm.handleSubmit(({ code, password }) => {
    complete.mutate({ email, code, password }, { onSuccess: () => setView("done") });
  });

  if (view === "done") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-gold/15">
          <CheckCircle className="size-6 text-gold" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-ink">Passordet er oppdatert</h2>
          <p className="text-sm text-ink-muted">Du kan nå logge inn med det nye passordet.</p>
        </div>
        <AuthButton type="button" onClick={onBack}>
          Tilbake til innlogging
        </AuthButton>
      </div>
    );
  }

  if (view === "reset") {
    return (
      <Form key="forgot-reset" {...resetForm}>
        <form onSubmit={onReset} className="space-y-5" noValidate>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-ink">Sjekk e-posten din</h2>
            <p className="text-sm text-ink-muted">
              Vi sendte en 6-sifret kode til{" "}
              <span className="font-semibold text-ink">{sentTo ?? email}</span>.
            </p>
          </div>

          {env.useMocks && (
            <p className="text-center text-sm text-ink-muted">
              Demo-modus — bruk kode{" "}
              <span className="font-mono font-medium text-ink">{MOCK_OTP_CODE}</span>.
            </p>
          )}

          {complete.isError && <AuthError message={complete.error.message} />}

          <FormField
            control={resetForm.control}
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

          <FormField
            control={resetForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    placeholder="Nytt passord"
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
            <AuthButton type="button" variant="outline" onClick={onBack}>
              Avbryt
            </AuthButton>
            <AuthButton type="submit" loading={complete.isPending}>
              Tilbakestill passord
            </AuthButton>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form key="forgot-request" {...requestForm}>
      <form onSubmit={onRequest} className="space-y-5" noValidate>
        <button
          type="button"
          onClick={onBack}
          aria-label="Tilbake til innlogging"
          className="flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Tilbake
        </button>

        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold text-ink">Glemt passord?</h2>
          <p className="text-sm text-ink-muted">
            Oppgi e-posten din, så sender vi deg en kode for å tilbakestille passordet.
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
                  placeholder="E-postadresse"
                  {...field}
                />
              </FormControl>
              <FormMessage className="ml-4 text-red-600" />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <AuthButton type="button" variant="outline" onClick={onBack}>
            Avbryt
          </AuthButton>
          <AuthButton type="submit" loading={start.isPending}>
            Send kode
          </AuthButton>
        </div>
      </form>
    </Form>
  );
}

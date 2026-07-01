import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AtSign, Ship } from "lucide-react";

import { ApiError } from "@/lib/apiClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useT, useLocale, formatDate } from "@/i18n";
import { makePasswordlessSchema, toPasswordlessInput, type PasswordlessForm } from "./schemas";
import { useInvitePreview, useJoin } from "./api/hooks";
import { useAuthStore } from "./store";
import { AuthLayout, AuthHeading } from "./components/AuthLayout";
import { IconInput } from "./components/IconInput";
import { AuthButton } from "./components/AuthButton";
import { AuthError } from "./components/AuthError";

/** True when an error is the backend's "this account is secured with a password" signal. */
function isNeedsPassword(err: unknown): boolean {
  return err instanceof ApiError && (err.body as { needsPassword?: boolean })?.needsPassword === true;
}

/** /join?invite=<token> — the landing the travel party reaches from a shared invite link.
 *  Shows which trip it's for, takes ONE identifier (email or phone), joins passwordlessly,
 *  and lands in the dashboard's group chat. Warm, no friction, no password. */
export function JoinPage() {
  const t = useT();
  const locale = useLocale();
  const [params] = useSearchParams();
  const token = params.get("invite");
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const preview = useInvitePreview(token);
  const join = useJoin();

  const form = useForm<PasswordlessForm>({
    resolver: zodResolver(makePasswordlessSchema(t)),
    defaultValues: { contact: "" },
  });

  const onJoin = form.handleSubmit(({ contact }) => {
    if (!token) return;
    join.mutate(
      { invite: token, ...toPasswordlessInput(contact) },
      {
        onSuccess: ({ token: jwt, user, status }) => {
          setSession(jwt, user, status);
          navigate("/dashboard", { replace: true });
        },
      }
    );
  });

  // No token at all → nothing to join.
  if (!token) {
    return (
      <AuthLayout subtitle={null}>
        <AuthHeading title={t("auth.join.missingTitle")} subtitle={t("auth.join.missingSubtitle")} />
        <p className="text-center text-sm text-ink-muted">{t("auth.join.missingBody")}</p>
      </AuthLayout>
    );
  }

  // Bad/expired token → calm dead-end-free message.
  if (preview.isError) {
    return (
      <AuthLayout subtitle={null}>
        <AuthHeading title={t("auth.join.invalidTitle")} subtitle={t("auth.join.invalidSubtitle")} />
        <p className="text-center text-sm text-ink-muted">{t("auth.join.invalidBody")}</p>
      </AuthLayout>
    );
  }

  const alreadyUsed = preview.data?.used;
  const needsPassword = join.isError && isNeedsPassword(join.error);

  return (
    <AuthLayout subtitle={null}>
      <AuthHeading title={t("auth.join.title")} subtitle={t("auth.join.subtitle")} />

      {/* Which trip this invite is for */}
      {preview.data && (
        <div className="mb-6 flex items-center gap-3 rounded-card border border-hairline bg-surface px-4 py-3 shadow-soft">
          <Ship className="size-4 shrink-0 text-gold" />
          <div className="min-w-0">
            <div className="font-mono text-sm font-semibold text-ink">
              {preview.data.reservationCode}
            </div>
            {preview.data.tripDate && (
              <div className="text-xs text-ink-muted">{formatDate(preview.data.tripDate, locale)}</div>
            )}
          </div>
        </div>
      )}

      {alreadyUsed ? (
        <p className="text-center text-sm text-ink-muted">{t("auth.join.alreadyUsed")}</p>
      ) : (
        <Form {...form}>
          <form onSubmit={onJoin} className="space-y-5" noValidate>
            {needsPassword ? (
              <p className="rounded-input border border-hairline bg-surface px-4 py-3 text-center text-sm text-ink-muted">
                {t("auth.join.securedPrefix")}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  {t("auth.login.withPassword")}
                </button>{" "}
                {t("auth.join.securedSuffix")}
              </p>
            ) : (
              join.isError && <AuthError message={join.error.message} />
            )}

            <FormField
              control={form.control}
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

            <AuthButton type="submit" loading={join.isPending || preview.isLoading}>
              {t("auth.join.submit")}
            </AuthButton>
          </form>
        </Form>
      )}
    </AuthLayout>
  );
}

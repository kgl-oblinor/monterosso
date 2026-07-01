import { useNavigate } from "react-router-dom";
import { Clock, RefreshCw } from "lucide-react";

import { useT } from "@/i18n";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { useRefreshStatus } from "@/features/auth/api/hooks";
import { useAuthStore } from "@/features/auth/store";

/** Shown to a logged-in customer/skipper whose account an admin hasn't approved yet. */
export function PendingApproval() {
  const t = useT();
  const navigate = useNavigate();
  const setStatus = useAuthStore((s) => s.setStatus);
  const logout = useAuthStore((s) => s.logout);
  const refresh = useRefreshStatus();

  const recheck = () =>
    refresh.mutate(undefined, {
      onSuccess: ({ status }) => setStatus(status),
    });

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold/15">
          <Clock className="size-8 text-gold" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-ink">{t("pending.title")}</h2>
          <p className="text-sm text-ink-muted">{t("pending.body")}</p>
        </div>

        {refresh.isSuccess && refresh.data.status !== "active" && (
          <p className="text-sm text-ink-muted">{t("pending.stillPending")}</p>
        )}

        <div className="flex flex-col gap-3">
          <AuthButton type="button" onClick={recheck} loading={refresh.isPending}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="size-4" /> {t("pending.recheck")}
            </span>
          </AuthButton>
          <AuthButton
            type="button"
            variant="outline"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            {t("pending.logout")}
          </AuthButton>
        </div>
      </div>
    </AuthLayout>
  );
}

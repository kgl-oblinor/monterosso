import { useNavigate } from "react-router-dom";
import { Clock, RefreshCw } from "lucide-react";

import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { useRefreshStatus } from "@/features/auth/api/hooks";
import { useAuthStore } from "@/features/auth/store";

/** Shown to a logged-in investor/loaner whose account an admin hasn't approved yet. */
export function PendingApproval() {
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
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-400/15">
          <Clock className="size-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Venter på godkjenning</h2>
          <p className="text-sm text-white/80">
            Takk! E-posten din er bekreftet. En administrator må godkjenne tilgangen din før du
            kan starte samtaler. Du får beskjed så snart kontoen er aktivert.
          </p>
        </div>

        {refresh.isSuccess && refresh.data.status !== "active" && (
          <p className="text-sm text-amber-300">Fortsatt under behandling — prøv igjen senere.</p>
        )}

        <div className="flex flex-col gap-3">
          <AuthButton type="button" onClick={recheck} loading={refresh.isPending}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="size-4" /> Sjekk status på nytt
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
            Logg ut
          </AuthButton>
        </div>
      </div>
    </AuthLayout>
  );
}

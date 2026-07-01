import { Loader2 } from "lucide-react";

import { useUsers } from "../api/hooks";
import { Initials, RowActions, StatusBadge } from "./AdminUI";
import { Centered, EmptyRow, ErrorBox, Thead } from "./SkippersTab";

const ROLE_LABEL: Record<string, string> = { customer: "Kunde", skipper: "Skipper" };

/** Accounts awaiting a decision — the admin's main queue. Pending first, then suspended. */
export function PendingTab() {
  const { data: users, isLoading, isError } = useUsers();

  const queue = (users ?? [])
    .filter((u) => u.status !== "active")
    .sort((a, b) => (a.status === "pending" && b.status !== "pending" ? -1 : 1));

  if (isLoading) {
    return (
      <Centered>
        <Loader2 className="size-5 animate-spin" /> Laster…
      </Centered>
    );
  }
  if (isError) return <ErrorBox>Kunne ikke laste kontoer.</ErrorBox>;

  return (
    <div className="overflow-x-auto rounded-card border border-hairline shadow-soft">
      <table className="w-full min-w-[680px] text-left text-sm">
        <Thead cols={["Navn", "E-post", "Rolle", "Opprettet", "Status", "Handling"]} />
        <tbody className="divide-y divide-hairline">
          {queue.map((u) => (
            <tr key={u.id} className="hover:bg-black/[0.04]">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Initials name={u.name} fallback={u.email} />
                  <span className="font-medium text-ink">{u.name ?? "—"}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-ink-muted">{u.email}</td>
              <td className="px-4 py-3 text-ink-muted">{ROLE_LABEL[u.role] ?? u.role}</td>
              <td className="px-4 py-3 text-ink-muted">{u.createdAt}</td>
              <td className="px-4 py-3">
                <StatusBadge status={u.status} />
              </td>
              <td className="px-4 py-3">
                <RowActions accountId={u.id} status={u.status} />
              </td>
            </tr>
          ))}
          {queue.length === 0 && (
            <EmptyRow cols={6} label="Ingen kontoer venter på godkjenning. 🎉" />
          )}
        </tbody>
      </table>
    </div>
  );
}

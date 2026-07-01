import { useState } from "react";
import { Ban, Check, Loader2, Pencil, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AccountStatus } from "../api/types";
import { useApprove, useRevoke } from "../api/hooks";

// --- inline email editor (shared by the skipper + customer directory tables) -
// Presentational: shows the on-file email with an edit pencil, or a "Legg til e-post"
// prompt when missing. `onSave` returns a promise; the editor closes on success.
export function EditableEmail({
  email,
  onSave,
  saving,
}: {
  email: string | null;
  onSave: (email: string) => Promise<unknown>;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(email ?? "");

  const save = async () => {
    const e = value.trim();
    if (!e) return;
    try {
      await onSave(e);
      setEditing(false);
    } catch {
      /* keep editor open; mutation error surfaces via the row state */
    }
  };

  if (editing) {
    return (
      <div className="mt-0.5 flex items-center gap-1">
        <input
          autoFocus
          type="email"
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") save();
            if (ev.key === "Escape") setEditing(false);
          }}
          placeholder="navn@eksempel.no"
          className="h-7 w-48 rounded-input border border-hairline bg-white px-2 text-xs text-ink placeholder:text-ink-muted focus:border-gold/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !value.trim()}
          aria-label="Lagre"
          className="flex size-7 items-center justify-center rounded-input bg-ink text-white disabled:opacity-40"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(email ?? "");
            setEditing(false);
          }}
          aria-label="Avbryt"
          className="flex size-7 items-center justify-center rounded-input border border-hairline text-ink-muted hover:bg-black/[0.04]"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  if (!email) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold/80"
      >
        <Plus className="size-3" /> Legg til e-post
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Rediger e-post"
      className="group mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
    >
      {email}
      <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

// --- stat card --------------------------------------------------------------

/** Single bordered card that holds several StatCard cells, split by dividers. */
export function StatGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 grid grid-cols-2 overflow-hidden rounded-card border border-hairline bg-white shadow-soft sm:grid-cols-4">
      {children}
    </div>
  );
}

/** One stat cell inside a StatGroup: faint divider on its left + a teal accent bar,
 *  then label / value / hint. Divider logic adapts to 2-col (mobile) and 4-col. */
export function StatCard({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: number | string;
  hint?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="relative border-hairline px-4 py-2.5 [&:nth-child(2)]:border-l [&:nth-child(3)]:border-t [&:nth-child(4)]:border-l [&:nth-child(4)]:border-t sm:border-t-0 sm:[&:not(:first-child)]:border-l before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-gold">
      <div className="pl-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{label}</div>
        <div className="mt-0.5 text-xl font-semibold leading-tight text-ink">
          {loading ? <span className="text-ink-muted">…</span> : value}
        </div>
        {hint && <div className="text-xs text-ink-muted">{hint}</div>}
      </div>
    </div>
  );
}

// --- status / registration badges ------------------------------------------

const STATUS_LABEL: Record<AccountStatus, string> = {
  active: "Aktiv",
  pending: "Venter",
  suspended: "Sperret",
};
const STATUS_CLASS: Record<AccountStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20",
  pending: "bg-gold/15 text-gold ring-gold/30",
  suspended: "bg-red-500/10 text-red-700 ring-red-600/20",
};

// Sort order for the directories: action-needed and registered rows first, the long tail
// of unregistered parties last. (pending → active → suspended → not registered)
export function statusRank(status: AccountStatus | null): number {
  switch (status) {
    case "pending":
      return 0;
    case "active":
      return 1;
    case "suspended":
      return 2;
    default:
      return 3;
  }
}

export function StatusBadge({ status }: { status: AccountStatus | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-muted ring-1 ring-inset ring-hairline">
        Ikke registrert
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_CLASS[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

// --- approve / revoke actions ----------------------------------------------

/** Action buttons for a directory row. Unregistered rows show a dash (they must claim an
 *  account before they can be approved). Registered rows get Godkjenn / Sperr. */
export function RowActions({
  accountId,
  status,
}: {
  accountId: number | null;
  status: AccountStatus | null;
}) {
  const approve = useApprove();
  const revoke = useRevoke();

  if (accountId == null || status == null) {
    return <span className="text-xs text-ink-muted">—</span>;
  }

  const busy =
    (approve.isPending && approve.variables === accountId) ||
    (revoke.isPending && revoke.variables === accountId);

  return (
    <div className="flex items-center justify-end gap-2">
      {busy && <Loader2 className="size-4 animate-spin text-ink-muted" />}
      {status !== "active" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => approve.mutate(accountId)}
          className="inline-flex h-8 items-center gap-1 rounded-pill bg-gold/15 px-3 text-xs font-semibold text-gold ring-1 ring-inset ring-gold/30 transition-colors hover:bg-gold/25 disabled:opacity-40"
        >
          <Check className="size-3.5" /> Godkjenn
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => revoke.mutate(accountId)}
          className="inline-flex h-8 items-center gap-1 rounded-pill border border-hairline px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-black/[0.04] disabled:opacity-40"
        >
          <Ban className="size-3.5" /> Sperr
        </button>
      )}
    </div>
  );
}

// --- shared avatar ----------------------------------------------------------

export function Initials({ name, fallback }: { name: string | null; fallback: string }) {
  const src = name?.trim() || fallback;
  const text = src.slice(0, 2).toUpperCase();
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
      {text}
    </span>
  );
}

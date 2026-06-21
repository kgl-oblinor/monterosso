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
          className="h-7 w-48 rounded-md border border-white/15 bg-white/5 px-2 text-xs text-white placeholder:text-white/30 focus:border-[#ead27e]/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !value.trim()}
          aria-label="Lagre"
          className="flex size-7 items-center justify-center rounded-md bg-[#ead27e] text-[#07182a] disabled:opacity-40"
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
          className="flex size-7 items-center justify-center rounded-md border border-white/15 text-white/60 hover:bg-white/5"
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
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200"
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
      className="group mt-0.5 inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white/70"
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
    <div className="mb-8 grid grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-white/[0.04] sm:grid-cols-4">
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
    <div className="relative border-white/10 px-4 py-2.5 [&:nth-child(2)]:border-l [&:nth-child(3)]:border-t [&:nth-child(4)]:border-l [&:nth-child(4)]:border-t sm:border-t-0 sm:[&:not(:first-child)]:border-l before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-[#ead27e]/80">
      <div className="pl-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</div>
        <div className="mt-0.5 text-xl font-semibold leading-tight text-white">
          {loading ? <span className="text-white/30">…</span> : value}
        </div>
        {hint && <div className="text-xs text-white/45">{hint}</div>}
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
  active: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  suspended: "bg-red-500/15 text-red-300 ring-red-500/30",
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
      <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/40 ring-1 ring-inset ring-white/10">
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
    return <span className="text-xs text-white/30">—</span>;
  }

  const busy =
    (approve.isPending && approve.variables === accountId) ||
    (revoke.isPending && revoke.variables === accountId);

  return (
    <div className="flex items-center justify-end gap-2">
      {busy && <Loader2 className="size-4 animate-spin text-white/40" />}
      {status !== "active" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => approve.mutate(accountId)}
          className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#ead27e] px-3 text-xs font-semibold text-[#07182a] transition-opacity hover:bg-[#f0dd9a] disabled:opacity-40"
        >
          <Check className="size-3.5" /> Godkjenn
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => revoke.mutate(accountId)}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/15 px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 disabled:opacity-40"
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
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ead27e]/20 text-xs font-semibold text-[#ead27e]">
      {text}
    </span>
  );
}

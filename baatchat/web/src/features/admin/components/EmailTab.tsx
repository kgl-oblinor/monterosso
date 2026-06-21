import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  Save,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import logoUrl from "@/oblinor-logo.svg";
import type { EmailAudience, Recipient, SendEmailResult } from "../api/types";
import {
  useAudienceCount,
  useRecipients,
  useSendEmail,
  useEmailDrafts,
  useSaveDraft,
  useDeleteDraft,
  fetchDraft,
  type EmailDraftSummary,
} from "../api/hooks";
import { EmailComposer } from "./EmailComposer";
import { SearchBox } from "./LoanersTab";

const PAGE_SIZE = 25;

// Word limits (kept in sync with the backend guard in /admin/email/send).
const SUBJECT_MIN = 3;
const SUBJECT_MAX = 100;
const BODY_MIN = 5;
const BODY_MAX = 1000;

function countWords(text: string): number {
  const t = text.replace(/\s+/g, " ").trim();
  return t ? t.split(" ").length : 0;
}

function htmlWordCount(html: string): number {
  return countWords(html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " "));
}

function htmlIsEmpty(html: string): boolean {
  return !html || html.replace(/<[^>]+>/g, "").replace(/ /g, " ").trim() === "";
}

/** Admin broadcast email: pick an audience, compose rich text, preview, and send. */
export function EmailTab() {
  const [audience, setAudience] = useState<EmailAudience>("loaners");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [testTo, setTestTo] = useState("kgl@oblinor.no");
  const [picked, setPicked] = useState<Record<"loaners" | "investors", Map<number, Recipient>>>({
    loaners: new Map(),
    investors: new Map(),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [draftId, setDraftId] = useState<number | null>(null);

  const send = useSendEmail();
  const drafts = useEmailDrafts();
  const saveDraft = useSaveDraft();
  const deleteDraft = useDeleteDraft();

  // Count for whole-audience modes; "selected" is counted locally.
  const audienceForCount = audience === "selected" ? "all" : audience;
  const { data: count, isLoading: countLoading } = useAudienceCount(audienceForCount);
  const selectedCount = picked.loaners.size + picked.investors.size;
  const recipientCount = audience === "selected" ? selectedCount : count ?? 0;

  const subjectWords = countWords(subject);
  const bodyWords = htmlWordCount(html);
  const subjectValid = subjectWords >= SUBJECT_MIN && subjectWords <= SUBJECT_MAX;
  const bodyValid = bodyWords >= BODY_MIN && bodyWords <= BODY_MAX;
  const canCompose = subjectValid && bodyValid;
  const canSend = canCompose && recipientCount > 0 && !send.isPending;

  const validationMsg = subjectValid
    ? bodyValid
      ? null
      : bodyWords > BODY_MAX
        ? `Innhold kan ha maks ${BODY_MAX} ord.`
        : `Innhold må ha minst ${BODY_MIN} ord.`
    : subjectWords > SUBJECT_MAX
      ? `Emne kan ha maks ${SUBJECT_MAX} ord.`
      : `Emne må ha minst ${SUBJECT_MIN} ord.`;

  const showResult = (r: SendEmailResult) => {
    if (r.test) {
      setFeedback(
        r.ok
          ? { kind: "ok", text: `Testmail sendt til ${testTo}.` }
          : { kind: "err", text: `Testmail feilet: ${r.errors?.[0] ?? "ukjent feil"}` }
      );
    } else if (r.ok) {
      setFeedback({ kind: "ok", text: `Sendt til ${r.sent} mottakere.` });
    } else {
      setFeedback({
        kind: "err",
        text: `${r.sent ?? 0} sendt, ${r.failed ?? 0} feilet: ${r.errors?.[0] ?? "ukjent feil"}`,
      });
    }
  };

  const onTest = () => {
    if (!testTo.trim() || !canCompose) return;
    setFeedback(null);
    send.mutate(
      { audience, subject, html, testTo: testTo.trim() },
      { onSuccess: showResult, onError: (e) => setFeedback({ kind: "err", text: String(e) }) }
    );
  };

  const onConfirmSend = () => {
    setConfirmOpen(false);
    setFeedback(null);
    send.mutate(
      {
        audience,
        subject,
        html,
        confirm: true,
        selected:
          audience === "selected"
            ? {
                loaners: [...picked.loaners.keys()],
                investors: [...picked.investors.keys()],
              }
            : undefined,
      },
      {
        onSuccess: (r) => {
          showResult(r);
          if (r.ok) {
            setSubject("");
            setHtml("");
          }
        },
        onError: (e) => setFeedback({ kind: "err", text: String(e) }),
      }
    );
  };

  // Save the current composition as a draft (new, or updating the loaded one).
  const onSaveDraft = () => {
    if (htmlIsEmpty(html) && !subject.trim()) return;
    setFeedback(null);
    saveDraft.mutate(
      {
        id: draftId ?? undefined,
        subject,
        html,
        audience,
        selected:
          audience === "selected"
            ? {
                loaners: [...picked.loaners.values()],
                investors: [...picked.investors.values()],
              }
            : undefined,
      },
      {
        onSuccess: (r) => {
          setDraftId(r.id);
          setFeedback({ kind: "ok", text: "Utkast lagret." });
        },
        onError: (e) => setFeedback({ kind: "err", text: String(e) }),
      }
    );
  };

  // Load a saved draft into the composer.
  const onLoadDraft = async (id: number) => {
    try {
      const d = await fetchDraft(id);
      setAudience(d.audience as EmailAudience);
      setSubject(d.subject);
      setHtml(d.html);
      const sel = d.selected as { loaners?: Recipient[]; investors?: Recipient[] } | null;
      setPicked({
        loaners: new Map((sel?.loaners ?? []).map((r) => [r.id, r])),
        investors: new Map((sel?.investors ?? []).map((r) => [r.id, r])),
      });
      setDraftId(d.id);
      setFeedback({ kind: "ok", text: "Utkast lastet inn." });
    } catch (e) {
      setFeedback({ kind: "err", text: String(e) });
    }
  };

  const onDeleteDraft = (id: number) => {
    deleteDraft.mutate(id, {
      onSuccess: () => {
        if (draftId === id) setDraftId(null);
      },
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      {/* Compose column */}
      <div className="space-y-5">
        {drafts.data && drafts.data.length > 0 && (
          <DraftsList
            drafts={drafts.data}
            activeId={draftId}
            onLoad={onLoadDraft}
            onDelete={onDeleteDraft}
            deletingId={deleteDraft.isPending ? (deleteDraft.variables ?? null) : null}
          />
        )}

        <AudiencePicker
          audience={audience}
          onChange={setAudience}
          count={count}
          countLoading={countLoading}
          selectedCount={selectedCount}
        />

        {audience === "selected" && (
          <RecipientPicker picked={picked} setPicked={setPicked} />
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-white/70">Emne</label>
            <WordCounter words={subjectWords} min={SUBJECT_MIN} max={SUBJECT_MAX} />
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="F.eks. Viktig oppdatering fra Oblinor"
            className="h-11 w-full rounded-md border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/40 focus:border-teal-400/50 focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-white/70">Innhold</label>
            <WordCounter words={bodyWords} min={BODY_MIN} max={BODY_MAX} />
          </div>
          <EmailComposer value={html} onChange={setHtml} />
          <p className="mt-1.5 text-xs text-white/40">
            Innholdet legges automatisk inn i Oblinors e-postmal med logo og signatur.
          </p>
        </div>

        {/* Test + send */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                Send testmail til deg selv
              </label>
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="kgl@oblinor.no"
                className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/40 focus:border-teal-400/50 focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={!testTo.trim() || !canCompose || send.isPending}
              onClick={onTest}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 disabled:opacity-40"
            >
              <Mail className="size-4" /> Send test
            </button>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-3">
            <button
              type="button"
              disabled={saveDraft.isPending || (htmlIsEmpty(html) && !subject.trim())}
              onClick={onSaveDraft}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 disabled:opacity-40"
            >
              {saveDraft.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {draftId ? "Oppdater utkast" : "Lagre utkast"}
            </button>
            <button
              type="button"
              disabled={!canSend}
              onClick={() => setConfirmOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-400 px-4 text-sm font-semibold text-[#04231d] transition-opacity hover:bg-teal-300 disabled:opacity-40"
            >
              {send.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send til {recipientCount.toLocaleString("nb-NO")} mottaker
              {recipientCount === 1 ? "" : "e"}
            </button>
            {validationMsg && <p className="mt-2 text-xs text-white/45">{validationMsg}</p>}
          </div>

          {feedback && (
            <div
              className={cn(
                "flex items-start gap-2 rounded-md px-3 py-2.5 text-sm",
                feedback.kind === "ok"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-red-500/10 text-red-300"
              )}
            >
              {feedback.kind === "ok" ? (
                <Check className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview column */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
          Forhåndsvisning
        </div>
        <EmailPreview subject={subject} html={html} />
      </div>

      {confirmOpen && (
        <ConfirmDialog
          count={recipientCount}
          subject={subject}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={onConfirmSend}
        />
      )}
    </div>
  );
}

// --- saved drafts list ------------------------------------------------------

function audienceLabel(a: string): string {
  return a === "loaners"
    ? "Låntakere"
    : a === "investors"
      ? "Långivere"
      : a === "all"
        ? "Alle"
        : "Utvalgte";
}
function draftTime(s: string): string {
  return new Date(s.replace(" ", "T") + "Z").toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DraftsList({
  drafts,
  activeId,
  onLoad,
  onDelete,
  deletingId,
}: {
  drafts: EmailDraftSummary[];
  activeId: number | null;
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-white/40">
        <FileText className="size-3.5" /> Lagrede utkast
      </div>
      <ul className="space-y-1">
        {drafts.map((d) => (
          <li
            key={d.id}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5",
              d.id === activeId ? "bg-teal-400/10" : "hover:bg-white/[0.04]"
            )}
          >
            <button type="button" onClick={() => onLoad(d.id)} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm text-white">{d.subject?.trim() || "Uten emne"}</span>
              <span className="block truncate text-[11px] text-white/40">
                {audienceLabel(d.audience)} · {draftTime(d.updatedAt)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(d.id)}
              disabled={deletingId === d.id}
              aria-label="Slett utkast"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/5 hover:text-red-300 disabled:opacity-40"
            >
              {deletingId === d.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Live "X / max ord" counter. Red when over max or below min (once typing starts). */
function WordCounter({ words, min, max }: { words: number; min: number; max: number }) {
  const tooFew = words > 0 && words < min;
  const tooMany = words > max;
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        tooFew || tooMany ? "text-red-300" : "text-white/40"
      )}
    >
      {words.toLocaleString("nb-NO")} / {max.toLocaleString("nb-NO")} ord
      {tooFew ? ` · minst ${min}` : ""}
    </span>
  );
}

// --- audience picker --------------------------------------------------------

function AudiencePicker({
  audience,
  onChange,
  count,
  countLoading,
  selectedCount,
}: {
  audience: EmailAudience;
  onChange: (a: EmailAudience) => void;
  count?: number;
  countLoading: boolean;
  selectedCount: number;
}) {
  const opts: { id: EmailAudience; label: string; hint: string; icon: typeof Users }[] = [
    { id: "loaners", label: "Alle låntakere", hint: "med minst ett lån", icon: Building2 },
    { id: "investors", label: "Alle långivere", hint: "som har investert", icon: Users },
    { id: "all", label: "Alle", hint: "låntakere + långivere", icon: Mail },
    { id: "selected", label: "Velg spesifikke", hint: "plukk mottakere selv", icon: Check },
  ];
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/70">Mottakere</label>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {opts.map((o) => {
          const Icon = o.icon;
          const active = audience === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "relative flex flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                active
                  ? "border-teal-400/60 bg-teal-400/15"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
              )}
            >
              {active && (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-teal-400 text-[#04231d]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-[10px]",
                  active ? "bg-teal-400 text-[#04231d]" : "bg-teal-400/10 text-teal-300"
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="text-sm leading-snug">
                <span className="font-semibold text-white">{o.label}</span>{" "}
                <span className="text-white/45">{o.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-400/10 px-3.5 py-1.5 text-xs font-medium text-teal-100">
        <ArrowRight className="size-3.5" />
        {audience === "selected" ? (
          <>Sendes til {selectedCount.toLocaleString("nb-NO")} mottakere</>
        ) : countLoading ? (
          "Teller mottakere…"
        ) : (
          <>Sendes til {(count ?? 0).toLocaleString("nb-NO")} mottakere</>
        )}
      </div>
    </div>
  );
}

// --- specific-recipients picker ---------------------------------------------

function RecipientPicker({
  picked,
  setPicked,
}: {
  picked: Record<"loaners" | "investors", Map<number, Recipient>>;
  setPicked: React.Dispatch<
    React.SetStateAction<Record<"loaners" | "investors", Map<number, Recipient>>>
  >;
}) {
  const [group, setGroup] = useState<"loaners" | "investors">("loaners");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isFetching } = useRecipients({
    group,
    search,
    page,
    pageSize: PAGE_SIZE,
  });
  const rows = data?.recipients ?? [];
  const total = data?.total ?? 0;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  const toggle = (r: Recipient) => {
    setPicked((prev) => {
      const next = new Map(prev[group]);
      if (next.has(r.id)) next.delete(r.id);
      else next.set(r.id, r);
      return { ...prev, [group]: next };
    });
  };

  const chosen = picked[group];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center gap-2">
        {(["loaners", "investors"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGroup(g);
              setPage(0);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              group === g ? "bg-teal-400/15 text-teal-200" : "text-white/55 hover:bg-white/5"
            )}
          >
            {g === "loaners" ? "Låntakere" : "Långivere"}
            {picked[g].size > 0 && (
              <span className="ml-1.5 rounded-full bg-teal-400/20 px-1.5 text-[11px] text-teal-200">
                {picked[g].size}
              </span>
            )}
          </button>
        ))}
      </div>

      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder={group === "loaners" ? "Søk på selskap eller e-post" : "Søk på navn eller e-post"}
      />

      <div className="overflow-hidden rounded-md border border-white/10">
        <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto">
          {isLoading ? (
            <li className="flex items-center justify-center gap-2 py-10 text-sm text-white/40">
              <Loader2 className="size-4 animate-spin" /> Laster…
            </li>
          ) : rows.length === 0 ? (
            <li className="py-10 text-center text-sm text-white/40">Ingen treff.</li>
          ) : (
            rows.map((r) => {
              const on = chosen.has(r.id);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        on ? "border-teal-400 bg-teal-400 text-[#04231d]" : "border-white/25"
                      )}
                    >
                      {on && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white">{r.name ?? "—"}</span>
                      <span className="block truncate text-xs text-white/40">{r.email}</span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/45">
        <span className="flex items-center gap-2">
          {total > 0 ? `${total.toLocaleString("nb-NO")} totalt` : "—"}
          {isFetching && <Loader2 className="size-3 animate-spin" />}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex size-7 items-center justify-center rounded-md border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={to >= total}
            onClick={() => setPage((p) => p + 1)}
            className="flex size-7 items-center justify-center rounded-md border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- preview ----------------------------------------------------------------

function EmailPreview({ subject, html }: { subject: string; html: string }) {
  const body = useMemo(
    () => (htmlIsEmpty(html) ? '<p style="color:#9aa7ab">Innholdet vises her…</p>' : html),
    [html]
  );
  return (
    <div className="overflow-hidden rounded-[20px] bg-[#eef1f2] p-4 shadow-inner">
      <div className="mx-auto max-w-[560px] overflow-hidden rounded-[13px] bg-white shadow-sm">
        <div className="px-6 pb-2 pt-7 text-center">
          <img src={logoUrl} alt="Oblinor" className="mx-auto h-10" />
        </div>
        {subject.trim() && (
          <div className="px-9 pt-2 text-center text-xs font-medium uppercase tracking-wide text-[#5b6b70]">
            {subject}
          </div>
        )}
        <div
          className="email-prose px-9 py-4"
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <div className="mx-9 border-t border-[#e6ebec]" />
        <div className="px-8 py-6 text-center">
          <p className="m-0 text-sm text-[#1f4a50]">Med vennlig hilsen</p>
          <img src={logoUrl} alt="Oblinor" className="mx-auto mt-3 h-8" />
          <p className="mt-3 text-[12px] leading-relaxed text-[#5b6b70]">
            Oblinor AS &nbsp;|&nbsp; C. J. Hambros plass 2D, 0164 Oslo
            <br />
            post@oblinor.no &nbsp;|&nbsp; oblinor.no &nbsp;|&nbsp; 920 52 000
          </p>
        </div>
      </div>
    </div>
  );
}

// --- confirm dialog ---------------------------------------------------------

function ConfirmDialog({
  count,
  subject,
  onCancel,
  onConfirm,
}: {
  count: number;
  subject: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a242b] p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Lukk"
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-md p-1 text-white/40 hover:bg-white/5 hover:text-white"
        >
          <X className="size-5" />
        </button>
        <div className="flex size-11 items-center justify-center rounded-full bg-amber-500/15">
          <AlertTriangle className="size-5 text-amber-300" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Bekreft utsending</h3>
        <p className="mt-2 text-sm text-white/60">
          Du er i ferd med å sende e-posten{" "}
          <span className="font-medium text-white/90">«{subject}»</span> til{" "}
          <span className="font-semibold text-teal-200">
            {count.toLocaleString("nb-NO")} mottakere
          </span>
          . Dette kan ikke angres.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md border border-white/15 px-4 text-sm font-medium text-white/70 hover:bg-white/5"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-400 px-4 text-sm font-semibold text-[#04231d] hover:bg-teal-300"
          >
            <Send className="size-4" /> Send nå
          </button>
        </div>
      </div>
    </div>
  );
}

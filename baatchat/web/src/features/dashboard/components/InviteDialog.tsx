import { useState } from "react";
import { Check, Copy, Link2, Loader2, X } from "lucide-react";

import { useCreateInvite, type CreatedInvite } from "../api/group";

/** A calm modal for inviting the travel party ("turfølget") into a trip's group chat.
 *  Optional email/phone (just recorded for context — anyone with the link can join), then a
 *  shareable link to copy + a "Del på WhatsApp" button. No auto-send: sharing is manual.
 *  Voice: warm, "Inviter", no pressure. */
export function InviteDialog({
  reservationCode,
  onClose,
}: {
  reservationCode: string;
  onClose: () => void;
}) {
  const [contact, setContact] = useState("");
  const [invite, setInvite] = useState<CreatedInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const create = useCreateInvite();

  const looksLikeEmail = (v: string) => v.includes("@");

  const onCreate = () => {
    const v = contact.trim();
    const payload: { reservationCode: string; email?: string; phone?: string } = { reservationCode };
    if (v) {
      if (looksLikeEmail(v)) payload.email = v;
      else payload.phone = v;
    }
    create.mutate(payload, { onSuccess: (inv) => setInvite(inv) });
  };

  const onCopy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const waText = invite
    ? `Hei! Bli med i reisefølget vårt for turen ${invite.reservationCode}. Trykk her for å komme inn i chatten: ${invite.link}`
    : "";
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-white/10 bg-[#0a1f33] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Inviter reisefølget</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              Del en lenke med dem du reiser sammen med, så er de inne i samme chat – uten passord.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {!invite ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                E-post eller telefon (valgfritt)
              </span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="navn@eksempel.no eller +47 …"
                inputMode="email"
                className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#ead27e]/40 focus:outline-none"
              />
            </label>
            <p className="text-xs leading-relaxed text-white/40">
              Du lager en lenke du deler selv. Vi sender ingenting automatisk ennå.
            </p>

            {create.isError && (
              <p className="text-sm text-red-300">{(create.error as Error).message}</p>
            )}

            <button
              type="button"
              onClick={onCreate}
              disabled={create.isPending}
              className="flex w-full items-center justify-center gap-2 border border-[#ead27e]/40 bg-[#ead27e]/15 px-5 py-3 text-sm font-semibold text-[#ead27e] transition-colors hover:bg-[#ead27e]/25 disabled:opacity-50"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              Lag invitasjonslenke
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <Link2 className="size-4 shrink-0 text-[#ead27e]/70" />
              <span className="min-w-0 flex-1 truncate text-sm text-white/75">{invite.link}</span>
              <button
                type="button"
                onClick={onCopy}
                aria-label="Kopier lenke"
                className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-[#ead27e]" /> Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Kopier
                  </>
                )}
              </button>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 border border-[#25D366]/40 bg-[#25D366]/15 px-5 py-3 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/25"
            >
              Del på WhatsApp
            </a>

            <p className="text-xs leading-relaxed text-white/40">
              Lenken gjelder for én person og brukes én gang. Trenger du å invitere flere, lag en ny.
            </p>

            <button
              type="button"
              onClick={() => {
                setInvite(null);
                setContact("");
              }}
              className="w-full border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              Inviter en til
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

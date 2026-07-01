import { useState } from "react";
import { Check, Copy, Link2, Loader2, X } from "lucide-react";

import { useT } from "@/i18n";
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
  const t = useT();
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
    ? t("invite.waMessage", { code: invite.reservationCode, link: invite.link })
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
        className="w-full max-w-md rounded-card border border-hairline bg-page p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">{t("invite.title")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t("invite.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("invite.close")}
            className="-mr-1 -mt-1 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        {!invite ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {t("invite.contactLabel")}
              </span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t("invite.contactPlaceholder")}
                inputMode="email"
                className="mt-2 w-full rounded-input border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
              />
            </label>
            <p className="text-xs leading-relaxed text-ink-muted">{t("invite.noAutoSend")}</p>

            {create.isError && (
              <p className="text-sm text-destructive">{(create.error as Error).message}</p>
            )}

            <button
              type="button"
              onClick={onCreate}
              disabled={create.isPending}
              className="btn-ink w-full gap-2 disabled:opacity-50"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              {t("invite.create")}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 rounded-input border border-hairline bg-surface px-3 py-2.5">
              <Link2 className="size-4 shrink-0 text-gold" />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{invite.link}</span>
              <button
                type="button"
                onClick={onCopy}
                aria-label={t("invite.copyAria")}
                className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-gold" /> {t("invite.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> {t("invite.copy")}
                  </>
                )}
              </button>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-pill border border-[#25D366]/40 bg-[#25D366]/15 px-5 py-3 text-sm font-semibold text-[#1a8f47] transition-[transform,background-color] hover:bg-[#25D366]/25 active:scale-[0.98]"
            >
              {t("invite.whatsapp")}
            </a>

            <p className="text-xs leading-relaxed text-ink-muted">{t("invite.oneUse")}</p>

            <button
              type="button"
              onClick={() => {
                setInvite(null);
                setContact("");
              }}
              className="w-full rounded-pill border border-hairline px-5 py-2.5 text-sm text-ink-muted transition-colors hover:border-black/20 hover:bg-black/[0.04] hover:text-ink active:scale-[0.98]"
            >
              {t("invite.again")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

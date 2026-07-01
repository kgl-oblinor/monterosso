import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Apple, Download, Play, Share, SquarePlus, X } from "lucide-react";

import { useT } from "@/i18n";

/** The `beforeinstallprompt` event (Chromium-only; not in the standard lib DOM types). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone/iPod, plus iPadOS which masquerades as a desktop Mac with touch.
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag when launched from the home screen.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Captures Chrome's deferred install prompt so we can trigger it from a button. */
function useInstallPrompt(): [BeforeInstallPromptEvent | null, () => void] {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep the prompt for our own button
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = () => {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(() => setDeferred(null));
  };

  return [deferred, install];
}

/** A coming-soon store badge (native apps aren't published yet). */
function StoreBadge({ icon, label, note }: { icon: React.ReactNode; label: string; note: string }) {
  return (
    <div className="flex items-center gap-3 rounded-input border border-hairline bg-surface px-3.5 py-2.5 opacity-70">
      <span className="text-ink">{icon}</span>
      <div className="min-w-0 leading-tight">
        <div className="text-sm font-semibold text-ink">{label}</div>
        <div className="text-[11px] uppercase tracking-wider text-ink-muted">{note}</div>
      </div>
    </div>
  );
}

/** Minimal, Apple-clean "Get the app" sheet.
 *  Android/Chrome → a real Install button (deferred beforeinstallprompt).
 *  iOS/Safari → Share → Add to Home Screen instructions (iOS has no install prompt).
 *  Both → coming-soon App Store / Google Play badges for the future native apps. */
export function GetAppDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [deferred, install] = useInstallPrompt();
  const ios = isIOS();
  const standalone = isStandalone();

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("getapp.title")}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card border border-hairline bg-page p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/icon.svg" alt="" className="size-11 rounded-xl" />
            <div>
              <h2 className="text-lg font-bold text-ink">{t("getapp.title")}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("getapp.close")}
            className="-mr-1 -mt-1 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("getapp.subtitle")}</p>

        <div className="mt-5">
          {standalone ? (
            <p className="rounded-input bg-surface px-4 py-3 text-sm text-ink-muted">
              {t("getapp.installed")}
            </p>
          ) : ios ? (
            /* iOS Safari: no install prompt — show the Add to Home Screen steps. */
            <div className="rounded-input bg-surface px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {t("getapp.iosTitle")}
              </div>
              <ol className="mt-3 space-y-3 text-sm text-ink">
                <li className="flex items-center gap-3">
                  <Share className="size-5 shrink-0 text-gold" />
                  <span>{t("getapp.iosStep1")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <SquarePlus className="size-5 shrink-0 text-gold" />
                  <span>{t("getapp.iosStep2")}</span>
                </li>
              </ol>
            </div>
          ) : deferred ? (
            /* Android/Chrome (and installable desktop): fire the real prompt. */
            <button type="button" onClick={install} className="btn-ink w-full gap-2">
              <Download className="size-4" />
              {t("getapp.install")}
            </button>
          ) : (
            <p className="rounded-input bg-surface px-4 py-3 text-sm text-ink-muted">
              {t("getapp.desktopHint")}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="text-xs font-medium text-ink-muted">{t("getapp.storesNote")}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StoreBadge
              icon={<Apple className="size-5" />}
              label={t("getapp.appStore")}
              note={t("getapp.comingSoon")}
            />
            <StoreBadge
              icon={<Play className="size-5" />}
              label={t("getapp.googlePlay")}
              note={t("getapp.comingSoon")}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

import type { ReactNode } from "react";

import logoUrl from "@/monterosso-mark.svg";
import { useT } from "@/i18n";

/** Calm white shell for the auth screens (shared Apple system). Clean white page, app brand
 *  on top, and a white card holding the active form (which renders its own heading). */
export function AuthLayout({
  children,
  subtitle,
}: {
  children: ReactNode;
  /** Brand tagline under the logo. Omit for the default tagline; pass null to hide it. */
  subtitle?: string | null;
}) {
  const t = useT();
  const tagline = subtitle === undefined ? t("auth.tagline") : subtitle;
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-md text-ink">
        <div className="rounded-card border border-hairline bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex flex-col items-center space-y-2 text-center">
            <img src={logoUrl} alt="" className="size-16 rounded-2xl" />
            {tagline && <p className="text-sm text-ink-muted">{tagline}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

/** Centered heading used at the top of each auth form. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 space-y-1 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="text-sm text-ink-muted">{subtitle}</p>
    </div>
  );
}

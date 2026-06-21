import type { ReactNode } from "react";

import logoUrl from "@/monterosso-mark.svg";

/** Branded glassmorphism shell for the auth screens. Teal gradient backdrop, app brand
 *  on top, and a translucent card holding the active form (which renders its own heading). */
export function AuthLayout({
  children,
  subtitle = "Chat mellom kunder og skippere",
}: {
  children: ReactNode;
  /** Brand tagline under the logo. Pass null to hide it (e.g. on the admin login). */
  subtitle?: string | null;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Dark teal gradient backdrop. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_0%,#134e4a_0%,#0a2a2e_42%,#020617_100%)]"
      />

      <div className="w-full max-w-md text-white">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-6 flex flex-col items-center space-y-2 text-center">
            <img src={logoUrl} alt="" className="size-16 rounded-xl shadow-lg" />
            {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
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
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-white/80">{subtitle}</p>
    </div>
  );
}

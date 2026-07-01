import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** "primary" = ink-filled pill CTA; "outline" = hairline-outlined white pill. */
  variant?: "primary" | "outline";
  loading?: boolean;
}

/** Pill CTA used across the auth screens — shared Apple system (ink primary / hairline secondary). */
export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ variant = "primary", loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap text-base",
        variant === "primary"
          ? "btn-ink"
          : "min-h-[44px] rounded-pill border border-hairline bg-white px-6 font-medium text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
AuthButton.displayName = "AuthButton";

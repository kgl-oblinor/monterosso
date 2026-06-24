import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** "primary" = solid gray CTA; "outline" = transparent with white border. */
  variant?: "primary" | "outline";
  loading?: boolean;
}

/** Pill CTA used across the auth screens — matches the branded gray/outline buttons. */
export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ variant = "primary", loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 px-6 py-2.5 text-base font-semibold shadow-widget transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "border-white bg-[#ddd0b0] text-black"
          : "border-white/50 bg-transparent text-white hover:border-white",
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

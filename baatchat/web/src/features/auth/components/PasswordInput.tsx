import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

/** White, pill-shaped password input with a lock icon and a show/hide eye toggle. */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const t = useT();
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-ink-muted">
        <Lock className="h-5 w-5" />
      </div>
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn(
          "auth-field h-12 w-full rounded-input border border-hairline bg-white pl-14 pr-12 text-base text-ink transition-all placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t("auth.password.hide") : t("auth.password.show")}
        className="absolute inset-y-0 right-0 flex items-center pr-5 text-ink-muted transition-colors hover:text-ink"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

/** White, pill-shaped password input with a lock icon and a show/hide eye toggle. */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-black/60">
        <Lock className="h-5 w-5" />
      </div>
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn(
          "auth-field h-12 w-full rounded-full border-2 border-white bg-white pl-14 pr-12 text-base text-black shadow-lg transition-all placeholder:text-black/60 focus:border-white focus:outline-none focus:ring-0",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Skjul passord" : "Vis passord"}
        className="absolute inset-y-0 right-0 flex items-center pr-5 text-black/60 transition-colors hover:text-black"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

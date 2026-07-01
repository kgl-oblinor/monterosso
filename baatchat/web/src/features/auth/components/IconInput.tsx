import * as React from "react";

import { cn } from "@/lib/utils";

interface IconInputProps extends React.ComponentProps<"input"> {
  icon: React.ReactNode;
}

/** White, pill-shaped input with an inline leading icon — matches the branded auth look.
 *  Forwards ref + a11y props (from react-hook-form's FormControl) to the real input. */
export const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon, className, ...props }, ref) => (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-ink-muted">
        {icon}
      </div>
      <input
        ref={ref}
        className={cn(
          "auth-field h-12 w-full rounded-input border border-hairline bg-white pl-14 pr-4 text-base text-ink transition-all placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30",
          className
        )}
        {...props}
      />
    </div>
  )
);
IconInput.displayName = "IconInput";

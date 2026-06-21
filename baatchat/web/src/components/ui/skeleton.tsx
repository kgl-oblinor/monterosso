import { cn } from "@/lib/utils";

/** Subtle pulsing placeholder block. Tuned for the dark chat shell (white-on-dark). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";

/** Circular initials avatar — soft gold tint with gold initials. Caller sets size via
 *  className (defaults to size-10). */
export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold",
        className
      )}
    >
      {initials}
    </div>
  );
}

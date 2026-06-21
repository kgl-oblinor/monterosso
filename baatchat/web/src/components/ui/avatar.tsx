import { cn } from "@/lib/utils";

/** Circular initials avatar — solid brand teal with dark initials. Caller sets size via
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
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-[#04231d]",
        className
      )}
    >
      {initials}
    </div>
  );
}

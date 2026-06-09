import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES, type ClientStatus } from "@/types/client";

interface ClientStatusBadgeProps {
  status: ClientStatus;
  size?: "sm" | "md";
  className?: string;
}

export function ClientStatusBadge({
  status,
  size = "md",
  className,
}: ClientStatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}

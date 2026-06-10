import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-slate-950 text-white " +
    "dark:bg-white/12 dark:text-slate-200",
  secondary:
    "bg-slate-100 text-slate-700 " +
    "dark:bg-white/8 dark:text-slate-300",
  destructive:
    "bg-red-50 text-red-700 " +
    "dark:bg-red-500/15 dark:text-red-400",
  outline:
    "border border-slate-200 bg-white text-slate-700 " +
    "dark:border-white/12 dark:bg-transparent dark:text-slate-300",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

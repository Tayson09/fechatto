import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "ghost" | "outline" | "secondary";

type ButtonProps = React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg" | "icon";
};

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200",
};

const sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 rounded-xl text-sm",
  lg: "h-11 px-5 rounded-2xl text-sm",
  icon: "h-10 w-10 rounded-2xl",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
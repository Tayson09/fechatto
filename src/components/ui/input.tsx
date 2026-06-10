import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400",
          "focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Dark mode: superfície elevada, texto claro
          "dark:border-white/10 dark:bg-[#16253a] dark:text-slate-100",
          "dark:placeholder:text-slate-500",
          "dark:focus:border-white/25 dark:focus:ring-white/8",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

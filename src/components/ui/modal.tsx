"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/70" />

      {/* Painel */}
      <div
        className={cn(
          "relative z-10 w-full rounded-3xl border border-slate-200 bg-white shadow-2xl",
          "dark:border-white/10 dark:bg-[#0f1b2d]",
          sizeClasses[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/6">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition",
                "hover:bg-slate-100 hover:text-slate-700",
                "dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

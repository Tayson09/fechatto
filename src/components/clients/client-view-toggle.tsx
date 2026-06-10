"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, Columns2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientViewToggle() {
  const pathname = usePathname();
  const isKanban = pathname === "/clients/kanban";

  return (
    <div className={cn(
      "flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm",
      "dark:border-white/8 dark:bg-[#0f1b2d]"
    )}>
      <Link
        href="/clients"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          !isKanban
            // Ativo: light = fundo azul + texto branco → dark = fundo branco + texto azul
            ? "bg-[#082a54] !text-white shadow-sm dark:bg-white dark:!text-[#082a54] dark:shadow-none"
            // Inativo: light = texto azul → dark = texto claro discreto
            : "text-[#082a54] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
        )}
      >
        <LayoutList className="h-4 w-4" />
        Lista
      </Link>
      <Link
        href="/clients/kanban"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          isKanban
            ? "bg-[#082a54] !text-white shadow-sm dark:bg-white dark:!text-[#082a54] dark:shadow-none"
            : "text-[#082a54] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
        )}
      >
        <Columns2 className="h-4 w-4" />
        Kanban
      </Link>
    </div>
  );
}

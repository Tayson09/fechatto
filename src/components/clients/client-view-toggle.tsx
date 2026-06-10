"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, Columns2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientViewToggle() {
  const pathname = usePathname();
  const isKanban = pathname === "/clients/kanban";

  return (
    <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <Link
        href="/clients"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          !isKanban
            ? "bg-[#082a54] !text-white shadow-sm"
            : "text-[#082a54] hover:bg-slate-100"
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
            ? "bg-[#082a54] !text-white shadow-sm"
            : "text-[#082a54] hover:bg-slate-100"
        )}
      >
        <Columns2 className="h-4 w-4" />
        Kanban
      </Link>
    </div>
  );
}

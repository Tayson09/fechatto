"use client";

import Link from "next/link";
import { Bell, MapPin, Pencil } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ClientCard } from "@/types/client";

interface ClientKanbanCardProps {
  client: ClientCard;
}

export function ClientKanbanCard({ client }: ClientKanbanCardProps) {
  const followUpDate = client.nextFollowUp ? new Date(client.nextFollowUp) : null;
  const isOverdue = followUpDate && isPast(followUpDate) && !isToday(followUpDate);
  const isFollowUpToday = followUpDate && isToday(followUpDate);

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/clients/${client.id}`}
          className="flex-1 text-sm font-medium text-slate-950 hover:text-[#082a54] hover:underline"
        >
          {client.name}
        </Link>
        <Link
          href={`/clients/${client.id}/edit`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      </div>

      {client.profile && (
        <p className="mt-1 text-xs text-slate-400">{client.profile}</p>
      )}

      {client.location && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="h-3 w-3 shrink-0" />
          {client.location}
        </div>
      )}

      {followUpDate && (
        <div className="mt-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isOverdue && "bg-red-50 text-red-600",
              isFollowUpToday && "bg-amber-50 text-amber-700",
              !isOverdue && !isFollowUpToday && "bg-slate-100 text-slate-500"
            )}
          >
            <Bell className="h-3 w-3" />
            {isOverdue
              ? "Atrasado"
              : isFollowUpToday
              ? "Hoje"
              : format(followUpDate, "dd/MM", { locale: ptBR })}
          </span>
        </div>
      )}
    </div>
  );
}

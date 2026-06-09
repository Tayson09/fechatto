"use client";

import Link from "next/link";
import { useState } from "react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Pencil, Archive, MoreHorizontal, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientStatusBadge } from "./client-status-badge";
import type { ClientCard } from "@/types/client";

interface ClientTableRowProps {
  client: ClientCard;
  onArchive: (id: string) => void;
}

function FollowUpChip({ date }: { date: string }) {
  const d = new Date(date);
  const overdue = isPast(d) && !isToday(d);
  const today = isToday(d);
  const soon = !overdue && !today && differenceInDays(d, new Date()) <= 7;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        overdue && "bg-red-50 text-red-600",
        today && "bg-amber-50 text-amber-700",
        soon && "bg-blue-50 text-blue-700",
        !overdue && !today && !soon && "bg-slate-100 text-slate-500"
      )}
    >
      <Bell className="h-3 w-3" />
      {overdue
        ? "Atrasado"
        : today
        ? "Hoje"
        : format(d, "dd/MM", { locale: ptBR })}
    </span>
  );
}

export function ClientTableRow({ client, onArchive }: ClientTableRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  async function handleArchive() {
    if (!confirm(`Arquivar "${client.name}"?`)) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      if (res.ok) onArchive(client.id);
    } finally {
      setArchiving(false);
      setMenuOpen(false);
    }
  }

  return (
    <tr className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      <td className="py-3.5 pl-5 pr-3">
        <div>
          <Link
            href={`/clients/${client.id}`}
            className="font-medium text-slate-950 hover:text-[#082a54] hover:underline"
          >
            {client.name}
          </Link>
          {client.profile && (
            <p className="mt-0.5 text-xs text-slate-400">{client.profile}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3.5">
        <ClientStatusBadge status={client.status} />
      </td>
      <td className="px-3 py-3.5 text-sm text-slate-500">
        {client.location || <span className="text-slate-300">—</span>}
      </td>
      <td className="px-3 py-3.5">
        {client.nextFollowUp ? (
          <div className="space-y-0.5">
            <FollowUpChip date={client.nextFollowUp} />
            {client.nextFollowUpNote && (
              <p className="text-xs text-slate-400">{client.nextFollowUpNote}</p>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-300">—</span>
        )}
      </td>
      <td className="py-3.5 pl-3 pr-5">
        <div className="relative flex items-center justify-end gap-1">
          <Link
            href={`/clients/${client.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-9 z-20 w-40 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg">
                <button
                  onClick={handleArchive}
                  disabled={archiving}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <Archive className="h-4 w-4" />
                  {archiving ? "Arquivando..." : "Arquivar cliente"}
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ClientStatusBadge } from "./client-status-badge";
import type { ClientCard } from "@/types/client";

interface FollowUpData {
  overdue: ClientCard[];
  upcoming: ClientCard[];
}

export function FollowUpList() {
  const [data, setData] = useState<FollowUpData>({ overdue: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients?view=follow-ups")
      .then((r) => r.json())
      .then(({ data: d }) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  const isEmpty = data.overdue.length === 0 && data.upcoming.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-300" />
        <p className="text-sm font-medium text-slate-600">Tudo em dia!</p>
        <p className="mt-1 text-xs text-slate-400">
          Nenhum follow-up vencido ou programado para os próximos 7 dias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.overdue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-600">
              Atrasados ({data.overdue.length})
            </h3>
          </div>
          <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
            {data.overdue.map((client, i) => (
              <FollowUpRow
                key={client.id}
                client={client}
                variant="overdue"
                isLast={i === data.overdue.length - 1}
              />
            ))}
          </div>
        </section>
      )}

      {data.upcoming.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-700">
              Próximos 7 dias ({data.upcoming.length})
            </h3>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {data.upcoming.map((client, i) => (
              <FollowUpRow
                key={client.id}
                client={client}
                variant="upcoming"
                isLast={i === data.upcoming.length - 1}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FollowUpRow({
  client,
  variant,
  isLast,
}: {
  client: ClientCard;
  variant: "overdue" | "upcoming";
  isLast: boolean;
}) {
  const date = client.nextFollowUp ? new Date(client.nextFollowUp) : null;

  return (
    <Link
      href={`/clients/${client.id}`}
      className={`flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 ${
        !isLast ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            variant === "overdue" ? "bg-red-50" : "bg-amber-50"
          }`}
        >
          <Bell
            className={`h-4 w-4 ${
              variant === "overdue" ? "text-red-500" : "text-amber-500"
            }`}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-950">{client.name}</p>
          {client.nextFollowUpNote && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {client.nextFollowUpNote}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <ClientStatusBadge status={client.status} size="sm" />
        {date && (
          <span className="text-xs text-slate-400">
            {variant === "overdue"
              ? `há ${formatDistanceToNowStrict(date, { locale: ptBR })}`
              : format(date, "dd/MM · HH:mm", { locale: ptBR })}
          </span>
        )}
      </div>
    </Link>
  );
}

"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  Archive,
  Bell,
  MapPin,
  Briefcase,
  DollarSign,
  Home,
  StickyNote,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { ClientHistoryFeed } from "@/components/clients/client-history-feed";
import { cn } from "@/lib/utils";
import {
  PROPERTY_TYPE_LABELS,
  type ClientDetail,
  type PropertyType,
} from "@/types/client";

function formatCurrency(v: number | string | null | undefined) {
  if (v == null || v === "") return "—";
  return Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(typeof v === "string" ? parseFloat(v) : v);
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) {
        router.push("/clients");
        return;
      }
      const { data } = await res.json();
      setClient(data);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function handleArchive() {
    if (!confirm(`Arquivar "${client?.name}"? O cliente ficará oculto da lista.`)) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/clients");
        router.refresh();
      }
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  if (!client) return null;

  const followUpDate = client.nextFollowUp ? new Date(client.nextFollowUp) : null;
  const followUpOverdue =
    followUpDate && isPast(followUpDate) && !isToday(followUpDate);
  const followUpToday = followUpDate && isToday(followUpDate);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para clientes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {client.name}
            </h1>
            <ClientStatusBadge status={client.status} />
          </div>
          {client.profile && (
            <p className="text-sm text-slate-500">{client.profile}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/clients/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            disabled={archiving}
            className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Archive className="h-4 w-4" />
            {archiving ? "Arquivando..." : "Arquivar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Ficha */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Ficha do cliente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {client.profession && (
                <InfoRow
                  icon={Briefcase}
                  label="Profissão"
                  value={client.profession}
                />
              )}
              {client.age && (
                <InfoRow
                  icon={null}
                  label="Idade"
                  value={`${client.age} anos`}
                />
              )}
              {client.income != null && (
                <InfoRow
                  icon={DollarSign}
                  label="Renda mensal"
                  value={formatCurrency(client.income)}
                />
              )}
              {client.location && (
                <InfoRow
                  icon={MapPin}
                  label="Localização desejada"
                  value={client.location}
                />
              )}
              {(client.priceMin != null || client.priceMax != null) && (
                <InfoRow
                  icon={DollarSign}
                  label="Orçamento"
                  value={
                    client.priceMin && client.priceMax
                      ? `${formatCurrency(client.priceMin)} – ${formatCurrency(client.priceMax)}`
                      : client.priceMin
                      ? `A partir de ${formatCurrency(client.priceMin)}`
                      : `Até ${formatCurrency(client.priceMax)}`
                  }
                />
              )}
              {client.propertyType.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Home className="h-3.5 w-3.5" />
                    Tipos de imóvel
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.propertyType.map((t) => (
                      <span
                        key={t}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {PROPERTY_TYPE_LABELS[t as PropertyType]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.notes && (
                <div className="sm:col-span-2">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <StickyNote className="h-3.5 w-3.5" />
                    Observações
                  </p>
                  <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Histórico */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <ClientHistoryFeed clientId={id} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Follow-up */}
          <div
            className={cn(
              "rounded-3xl border p-5 shadow-sm",
              followUpOverdue
                ? "border-red-200 bg-red-50"
                : followUpToday
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white"
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <Bell
                className={cn(
                  "h-4 w-4",
                  followUpOverdue
                    ? "text-red-500"
                    : followUpToday
                    ? "text-amber-500"
                    : "text-slate-400"
                )}
              />
              <h3
                className={cn(
                  "text-sm font-semibold",
                  followUpOverdue
                    ? "text-red-700"
                    : followUpToday
                    ? "text-amber-700"
                    : "text-slate-700"
                )}
              >
                Próximo follow-up
              </h3>
            </div>

            {followUpDate ? (
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-base font-semibold",
                    followUpOverdue
                      ? "text-red-800"
                      : followUpToday
                      ? "text-amber-800"
                      : "text-slate-950"
                  )}
                >
                  {format(followUpDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    followUpOverdue
                      ? "text-red-600"
                      : followUpToday
                      ? "text-amber-600"
                      : "text-slate-500"
                  )}
                >
                  {format(followUpDate, "HH:mm", { locale: ptBR })}
                </p>
                {client.nextFollowUpNote && (
                  <p className="mt-2 text-sm text-slate-600">
                    {client.nextFollowUpNote}
                  </p>
                )}
                {followUpOverdue && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Follow-up atrasado! Contate este cliente.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nenhum follow-up agendado.</p>
            )}

            <Link
              href={`/clients/${id}/edit`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Editar follow-up
            </Link>
          </div>

          {/* Meta info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-500">Informações</h3>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Cadastrado em</span>
                <span className="font-medium text-slate-700">
                  {format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span className="font-medium text-slate-700">
                  {format(new Date(client.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType | null;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

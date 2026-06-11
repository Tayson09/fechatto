"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Filter,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Tag,
  TrendingUp,
  X,
  XCircle,
  Eye,
  FileText,
  MapPin,
  Building2,
  MessageSquareMore,
  CheckCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type NegotiationStatus = "IN_PROGRESS" | "CLOSED_WON" | "CLOSED_LOST";

interface Client {
  id: string;
  name: string;
}

interface Property {
  id: string;
  type: string;
  address: string;
  city: string;
}

interface NegotiationItem {
  id: string;
  status: NegotiationStatus;
  commission: string | number;
  notes: string | null;
  closedAt: string | null;
  createdAt: string;
  client: Client;
  property: Property;
}

interface NegotiationsResponse {
  data: NegotiationItem[];
  page: number;
  limit: number;
}

interface VisitItem {
  id: string;
  date: string;
  result: string | null;
  createdAt: string;
}

interface CreateForm {
  clientId: string;
  propertyId: string;
  notes: string;
}

interface CloseForm {
  status: NegotiationStatus | "";
  notes: string;
}

interface VisitForm {
  date: string;
  result: string;
}

interface Stats {
  total: number;
  inProgress: number;
  won: number;
  lost: number;
  totalCommission: number;
}

const statusMeta: Record<NegotiationStatus, { label: string; className: string; icon: React.ReactNode }> = {
  IN_PROGRESS: {
    label: "Em andamento",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  CLOSED_WON: {
    label: "Fechada com sucesso",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  CLOSED_LOST: {
    label: "Encerrada sem venda",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const propertyTypeLabel: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
};

function formatMoney(value: string | number) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function NegotiationsPage() {
  const router = useRouter();
  const [data, setData] = useState<NegotiationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState<NegotiationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalLoaded, setTotalLoaded] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<NegotiationItem | null>(null);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [properties, setProperties] = useState<Array<{ id: string; type: string; address: string; city: string }>>([]);

  const [createForm, setCreateForm] = useState({ clientId: "", propertyId: "", notes: "" });
  const [closeForm, setCloseForm] = useState<{ status: NegotiationStatus | ""; notes: string }>({
    status: "CLOSED_WON",
    notes: "",
  });
  const [visitForm, setVisitForm] = useState<{ date: string; result: string }>({
    date: new Date().toISOString().slice(0, 16),
    result: "",
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchesStatus = status === "ALL" ? true : item.status === status;
      const matchesTerm =
        !term ||
        item.client.name.toLowerCase().includes(term) ||
        item.property.address.toLowerCase().includes(term) ||
        item.property.city.toLowerCase().includes(term) ||
        propertyTypeLabel[item.property.type]?.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [data, search, status]);

  const stats = useMemo(() => {
    const total = data.length;
    const inProgress = data.filter((x) => x.status === "IN_PROGRESS").length;
    const won = data.filter((x) => x.status === "CLOSED_WON").length;
    const lost = data.filter((x) => x.status === "CLOSED_LOST").length;
    const totalCommission = data
      .filter((x) => x.status === "CLOSED_WON")
      .reduce((acc, item) => acc + Number(item.commission ?? 0), 0);
    return { total, inProgress, won, lost, totalCommission };
  }, [data]);

  async function fetchNegotiations(currentPage = page, currentStatus = status) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (currentStatus !== "ALL") params.set("status", currentStatus);

      const res = await fetch(`/api/negotiations?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = (await res.json()) as NegotiationsResponse & { error?: string };

      if (!res.ok) throw new Error(json.error || "Falha ao carregar negociações");
      setData(json.data ?? []);
      setTotalLoaded(json.data?.length ?? 0);
      setPage(json.page ?? currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function fetchReferenceData() {
    try {
      const [clientsRes, propertiesRes] = await Promise.allSettled([
        fetch("/api/clients?limit=100"),
        fetch("/api/properties?limit=100"),
      ]);

      if (clientsRes.status === "fulfilled") {
        const c = await clientsRes.value.json().catch(() => null);
        const list = Array.isArray(c?.data) ? c.data : [];
        setClients(list.map((item: { id: string; name: string }) => ({ id: item.id, name: item.name })));
      }

      if (propertiesRes.status === "fulfilled") {
        const p = await propertiesRes.value.json().catch(() => null);
        const list = Array.isArray(p?.data) ? p.data : [];
        setProperties(
          list.map((item: { id: string; type: string; address: string; city: string }) => ({
            id: item.id,
            type: item.type,
            address: item.address,
            city: item.city,
          }))
        );
      }
    } catch {
      // Reference loading is optional for a good UX; the form still works if your APIs differ.
    }
  }

  useEffect(() => {
    fetchNegotiations();
    fetchReferenceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNegotiations(page, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  async function handleCreateNegotiation() {
    if (!createForm.clientId || !createForm.propertyId) return;
    setMutating(true);
    try {
      const res = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: createForm.clientId,
          propertyId: createForm.propertyId,
          notes: createForm.notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao criar negociação");
      setCreateOpen(false);
      setCreateForm({ clientId: "", propertyId: "", notes: "" });
      await fetchNegotiations(page, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  async function openDetails(item: NegotiationItem) {
    setSelected(item);
    setDetailsOpen(true);
    setVisitsLoading(true);
    try {
      const res = await fetch(`/api/negotiations/${item.id}/visits`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao carregar visitas");
      setVisits(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  }

  async function handleCloseNegotiation() {
    if (!selected || !closeForm.status) return;
    setMutating(true);
    try {
      const res = await fetch(`/api/negotiations/${selected.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: closeForm.status,
          notes: closeForm.notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao encerrar negociação");
      setCloseOpen(false);
      setCloseForm({ status: "CLOSED_WON", notes: "" });
      setSelected(null);
      await fetchNegotiations(page, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  async function handleCreateVisit() {
    if (!selected || !visitForm.date) return;
    setMutating(true);
    try {
      const res = await fetch(`/api/negotiations/${selected.id}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: visitForm.date,
          result: visitForm.result || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao registrar visita");
      setVisitOpen(false);
      setVisitForm({ date: new Date().toISOString().slice(0, 16), result: "" });
      await openDetails(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  const emptyState = !loading && filtered.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              Módulo de negociações
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Gestão de Negociações
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Acompanhe clientes, imóveis, visitas, comissão e encerramento de cada oportunidade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => fetchNegotiations(page, status)}>
              <Loader2 className={cn("h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova negociação
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total carregado" value={String(stats.total)} icon={<FileText className="h-4 w-4" />} description={`Página ${page} • ${totalLoaded} registros`} />
          <StatCard title="Em andamento" value={String(stats.inProgress)} icon={<Clock3 className="h-4 w-4" />} description="Oportunidades ativas" />
          <StatCard title="Fechadas com sucesso" value={String(stats.won)} icon={<CheckCheck className="h-4 w-4" />} description="Conversões concluídas" />
          <StatCard title="Perdidas" value={String(stats.lost)} icon={<ShieldAlert className="h-4 w-4" />} description="Encerradas sem venda" />
          <StatCard title="Comissão gerada" value={formatMoney(stats.totalCommission)} icon={<CircleDollarSign className="h-4 w-4" />} description="Somente fechadas com sucesso" />
        </div>

        <Card className="mt-6 border-slate-200/70 shadow-sm">
          <CardHeader className="space-y-4 border-b border-slate-100 bg-white/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">Pipeline de negociações</CardTitle>
                <CardDescription>Filtre, pesquise e acesse as ações principais da sua operação.</CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por cliente, imóvel, cidade..."
                    className="pl-9"
                  />
                </div>
                <div className="w-full sm:w-[220px]">
                  <Select value={status} onValueChange={(value: string) => setStatus(value as NegotiationStatus | "ALL") }>
                    <SelectTrigger className="gap-2">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Filtrar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os status</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                      <SelectItem value="CLOSED_WON">Fechadas com sucesso</SelectItem>
                      <SelectItem value="CLOSED_LOST">Encerradas sem venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "IN_PROGRESS", "CLOSED_WON", "CLOSED_LOST"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                    status === item
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {item === "ALL" ? "Todos" : statusMeta[item as NegotiationStatus].label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4 sm:p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid gap-3 rounded-2xl border border-slate-100 p-4 sm:grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.6fr]">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Não foi possível carregar os dados.</p>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              </div>
            ) : emptyState ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Tag className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">Nenhuma negociação encontrada</h3>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Ajuste o filtro, refine a busca ou crie uma nova negociação para iniciar o acompanhamento.
                </p>
                <Button className="mt-5 gap-2" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Criar negociação
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead className="sticky top-0 z-10 bg-slate-50/90 text-left text-xs uppercase tracking-wide text-slate-500 backdrop-blur">
                    <tr>
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Imóvel</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Comissão</th>
                      <th className="px-6 py-4 font-medium">Atualização</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((item) => {
                      const meta = statusMeta[item.status];
                      return (
                        <tr key={item.id} className="group bg-white transition hover:bg-slate-50/80">
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                                {item.client.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-950">{item.client.name}</div>
                                <div className="text-sm text-slate-500">#{item.client.id.slice(0, 8)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                {propertyTypeLabel[item.property.type] ?? item.property.type}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                {item.property.address} • {item.property.city}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <Badge variant="outline" className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1", meta.className)}>
                              {meta.icon}
                              {meta.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 align-middle text-sm font-semibold text-slate-950">
                            {formatMoney(item.commission)}
                          </td>
                          <td className="px-6 py-4 align-middle text-sm text-slate-500">
                            {formatDate(item.closedAt ?? item.createdAt)}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex justify-end gap-2 opacity-100 transition lg:opacity-70 lg:group-hover:opacity-100">
                              <Button variant="ghost" size="sm" className="gap-2" onClick={() => openDetails(item)}>
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
                              {item.status === "IN_PROGRESS" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                      setSelected(item);
                                      setCloseForm({ status: "CLOSED_WON", notes: item.notes ?? "" });
                                      setCloseOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Encerrar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                      setSelected(item);
                                      setVisitOpen(true);
                                    }}
                                  >
                                    <CalendarDays className="h-4 w-4" />
                                    Visita
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm text-slate-500">
            Exibindo <span className="font-medium text-slate-900">{filtered.length}</span> negociações nesta visualização.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600">
              Página {page}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || filtered.length < limit}
              className="gap-2"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova negociação</DialogTitle>
            <DialogDescription>
              Selecione um cliente e um imóvel para iniciar o acompanhamento comercial.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={createForm.clientId}
                onValueChange={(value: string) => setCreateForm((s) => ({ ...s, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Imóvel</Label>
              <Select
                value={createForm.propertyId}
                onValueChange={(value: string) => setCreateForm((s) => ({ ...s, propertyId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {propertyTypeLabel[property.type] ?? property.type} • {property.address}, {property.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Detalhes relevantes da negociação..."
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateNegotiation} disabled={mutating || !createForm.clientId || !createForm.propertyId} className="gap-2">
              {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar negociação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Encerrar negociação</DialogTitle>
            <DialogDescription>
              Defina o resultado final e adicione um resumo do encerramento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Status final</Label>
            <Select value={closeForm.status} onValueChange={(value: string) => setCloseForm((s) => ({ ...s, status: value as NegotiationStatus }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLOSED_WON">Fechada com sucesso</SelectItem>
                <SelectItem value="CLOSED_LOST">Encerrada sem venda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={closeForm.notes}
              onChange={(e) => setCloseForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Motivo do fechamento, detalhes da venda, objeções, etc."
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCloseOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCloseNegotiation} disabled={mutating || !closeForm.status} className="gap-2">
              {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirmar encerramento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar visita</DialogTitle>
            <DialogDescription>
              Adicione data e resultado da visita para manter o histórico completo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Data da visita</Label>
            <Input
              type="datetime-local"
              value={visitForm.date}
              onChange={(e) => setVisitForm((s) => ({ ...s, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Resultado / feedback</Label>
            <Textarea
              value={visitForm.result}
              onChange={(e) => setVisitForm((s) => ({ ...s, result: e.target.value }))}
              placeholder="Como foi a visita? Houve interesse? Próximo passo?"
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setVisitOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVisit} disabled={mutating || !visitForm.date} className="gap-2">
              {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
              Salvar visita
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 to-slate-900 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-300">
                  <MessageSquareMore className="h-3.5 w-3.5" />
                  Detalhes da negociação
                </div>
                <DialogTitle className="text-2xl text-white">{selected?.client.name ?? "Negociação"}</DialogTitle>
                <DialogDescription className="mt-1 text-slate-300">
                  {selected ? `${selected.property.address} • ${selected.property.city}` : ""}
                </DialogDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selected && (
                  <Badge className={cn("rounded-full px-3 py-1 text-sm", statusMeta[selected.status].className)}>
                    {statusMeta[selected.status].label}
                  </Badge>
                )}
                {selected?.status === "IN_PROGRESS" && (
                  <Button variant="secondary" className="gap-2" onClick={() => setCloseOpen(true)}>
                    <CheckCircle2 className="h-4 w-4" />
                    Encerrar
                  </Button>
                )}
                {selected?.status === "IN_PROGRESS" && (
                  <Button variant="secondary" className="gap-2" onClick={() => setVisitOpen(true)}>
                    <CalendarDays className="h-4 w-4" />
                    Nova visita
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailBox label="Cliente" value={selected?.client.name ?? "—"} />
                <DetailBox label="Imóvel" value={selected ? propertyTypeLabel[selected.property.type] ?? selected.property.type : "—"} />
                <DetailBox label="Endereço" value={selected ? `${selected.property.address} • ${selected.property.city}` : "—"} />
                <DetailBox label="Comissão" value={selected ? formatMoney(selected.commission) : "—"} />
                <DetailBox label="Criada em" value={selected ? formatDate(selected.createdAt) : "—"} />
                <DetailBox label="Encerrada em" value={selected ? formatDate(selected.closedAt) : "—"} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-900">Observações</div>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                  {selected?.notes || "Nenhuma observação registrada."}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 p-6 md:border-l md:border-t-0">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Histórico de visitas</h3>
                  <p className="text-sm text-slate-500">Acompanhe o progresso da oportunidade.</p>
                </div>
                {selected?.status === "IN_PROGRESS" && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setVisitOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {visitsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="mt-3 h-4 w-full" />
                      <Skeleton className="mt-2 h-4 w-5/6" />
                    </div>
                  ))
                ) : visits.length ? (
                  visits.map((visit) => (
                    <div key={visit.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-950">{formatDate(visit.date)}</div>
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-600">
                          Visita
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {visit.result || "Sem feedback registrado."}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                    Nenhuma visita registrada ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-slate-200/70 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Eye,
  Filter,
  Image as ImageIcon,
  Link2,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Unlink,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const statusMeta = {
  AVAILABLE: {
    label: "Disponível",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  RESERVED: {
    label: "Reservado",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  SOLD: {
    label: "Vendido",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
} as const;

type PropertyStatus = keyof typeof statusMeta;
type PropertyType = "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";

type PropertyPhoto = {
  id: string;
  url: string;
  order: number;
};

type PropertyItem = {
  id: string;
  type: PropertyType;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string | null;
  area: string | number | null;
  price: string | number;
  commission: string | number;
  status: PropertyStatus;
  shareToken: string | null;
  shareEnabled: boolean;
  shareViews: number;
  createdAt: string;
  updatedAt: string;
  photos: PropertyPhoto[];
};

type PropertiesResponse = {
  data: PropertyItem[];
  page: number;
  limit: number;
};

type PropertyDetailResponse = {
  data: PropertyItem;
};

const typeLabel: Record<PropertyType, string> = {
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
    minimumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PropertiesModule() {
  const router = useRouter();
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [selected, setSelected] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PropertyStatus>("ALL");
  const [type, setType] = useState<"ALL" | PropertyType>("ALL");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNote, setQuickNote] = useState("");

  async function fetchProperties(currentPage = page, currentStatus = status, currentType = type) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (currentStatus !== "ALL") params.set("status", currentStatus);
      if (currentType !== "ALL") params.set("type", currentType);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/properties?${params.toString()}`);
      const json = (await res.json()) as PropertiesResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Falha ao carregar imóveis");

      setItems(Array.isArray(json.data) ? json.data : []);
      setPage(json.page ?? currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties(page, status, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, type]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetchProperties(1, status, type);
    }, 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.status === "AVAILABLE").length;
    const reserved = items.filter((i) => i.status === "RESERVED").length;
    const sold = items.filter((i) => i.status === "SOLD").length;
    const shared = items.filter((i) => i.shareEnabled).length;
    const totalViews = items.reduce((acc, item) => acc + Number(item.shareViews ?? 0), 0);
    const totalValue = items.reduce((acc, item) => acc + Number(item.price ?? 0), 0);
    return { total, available, reserved, sold, shared, totalViews, totalValue };
  }, [items]);

  const featured = useMemo(() => {
    return [...items].sort((a, b) => Number(b.shareViews ?? 0) - Number(a.shareViews ?? 0))[0] ?? null;
  }, [items]);

  async function openDetails(id: string) {
    setDetailsOpen(true);
    setDetailLoading(true);
    setSelected(null);
    setError(null);

    try {
      const res = await fetch(`/api/properties/${id}`);
      const json = (await res.json()) as PropertyDetailResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Falha ao carregar imóvel");
      setSelected(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setDetailLoading(false);
    }
  }

  async function refreshShareState() {
    await fetchProperties(page, status, type);
    if (selected) {
      await openDetails(selected.id);
    }
  }

  async function generateShareLink(id: string) {
    setMutating(true);
    try {
      const res = await fetch(`/api/properties/${id}/share`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao gerar link público");
      setShareMessage(json.data?.shareUrl || "Link gerado com sucesso");
      await refreshShareState();
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  async function toggleShare(property: PropertyItem) {
    setMutating(true);
    try {
      const res = await fetch(`/api/properties/${property.id}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !property.shareEnabled }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar compartilhamento");
      await refreshShareState();
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  async function markStatus(id: string, newStatus: PropertyStatus) {
    setMutating(true);
    try {
      const res = await fetch(`/api/properties/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar status");
      await refreshShareState();
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  async function addQuickNote(id: string) {
    if (!quickNote.trim()) return;
    setMutating(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: quickNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao salvar observação");
      setQuickNoteOpen(false);
      setQuickNote("");
      await refreshShareState();
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setMutating(false);
    }
  }

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTerm =
        !term ||
        item.address.toLowerCase().includes(term) ||
        (item.neighborhood ?? "").toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term);
      return matchesTerm;
    });
  }, [items, search]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.05),_transparent_32%),linear-gradient(to_bottom,_#f8fafc,_#fff)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Módulo carro-chefe da plataforma
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Imóveis com presença premium e compartilhamento inteligente
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Gerencie sua carteira, publique links públicos com um clique e acompanhe o desempenho dos imóveis em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => fetchProperties(1, status, type)}>
              <Loader2 className={cn("h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
            <Button className="gap-2" onClick={() => router.push("/properties/new")}>
              <Plus className="h-4 w-4" />
              Novo imóvel
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Total" value={stats.total} icon={<Building2 className="h-4 w-4" />} subtitle="Imóveis carregados" />
          <StatCard title="Disponíveis" value={stats.available} icon={<CheckCircle2 className="h-4 w-4" />} subtitle="Prontos para oferta" />
          <StatCard title="Reservados" value={stats.reserved} icon={<CalendarDays className="h-4 w-4" />} subtitle="Em acompanhamento" />
          <StatCard title="Vendidos" value={stats.sold} icon={<XCircle className="h-4 w-4" />} subtitle="Finalizados" />
          <StatCard title="Links ativos" value={stats.shared} icon={<Link2 className="h-4 w-4" />} subtitle="Compartilhamento ligado" />
          <StatCard title="Views" value={stats.totalViews} icon={<Eye className="h-4 w-4" />} subtitle="Acessos públicos" />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="space-y-4 border-b border-slate-100 bg-white/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-xl">Painel de imóveis</CardTitle>
                  <CardDescription>Listagem viva com filtros, compartilhamento e ações rápidas.</CardDescription>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative w-full sm:w-[320px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por endereço, bairro ou cidade"
                      className="pl-9"
                    />
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                      <SelectTrigger className="gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos os status</SelectItem>
                        <SelectItem value="AVAILABLE">Disponível</SelectItem>
                        <SelectItem value="RESERVED">Reservado</SelectItem>
                        <SelectItem value="SOLD">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                      <SelectTrigger className="gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos os tipos</SelectItem>
                        <SelectItem value="HOUSE">Casa</SelectItem>
                        <SelectItem value="APARTMENT">Apartamento</SelectItem>
                        <SelectItem value="LAND">Terreno</SelectItem>
                        <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                      <Skeleton className="h-56 w-full rounded-none" />
                      <div className="space-y-4 p-5">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                  {error}
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <ImageIcon className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">Nenhum imóvel encontrado</h3>
                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    Ajuste os filtros ou crie um novo imóvel para começar a exibir a carteira.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {visible.map((item, index) => {
                    const cover = item.photos?.[0]?.url ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";
                    const isFeatured = featured?.id === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={cn(
                          "group overflow-hidden rounded-[28px] border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
                          isFeatured ? "border-slate-300 ring-1 ring-slate-900/5" : "border-slate-200"
                        )}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <img src={cover} alt={item.address} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <Badge className={cn("rounded-full px-3 py-1 text-xs", statusMeta[item.status].className)}>
                              {statusMeta[item.status].label}
                            </Badge>
                            <Badge variant="outline" className="rounded-full border-white/40 bg-white/85 text-slate-700 backdrop-blur">
                              {typeLabel[item.type]}
                            </Badge>
                            {isFeatured && (
                              <Badge className="rounded-full border-amber-200 bg-amber-100 px-3 py-1 text-amber-800">
                                <Star className="mr-1 h-3.5 w-3.5" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                            <div>
                              <div className="text-lg font-semibold">{formatMoney(item.price)}</div>
                              <div className="text-xs text-white/80">Comissão {formatMoney(item.commission)}</div>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-right text-xs backdrop-blur-md">
                              <div className="font-semibold">{item.area ?? "—"} m²</div>
                              <div className="text-white/80">Área</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5 p-5">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-950">{item.address}</h3>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                  <MapPin className="h-4 w-4" />
                                  {[item.neighborhood, item.city].filter(Boolean).join(" • ")}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => openDetails(item.id)}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <Metric label="Views" value={String(item.shareViews ?? 0)} />
                            <Metric label="Link" value={item.shareEnabled ? "Ativo" : "Off"} />
                            <Metric label="Fotos" value={String(item.photos?.length ?? 0)} />
                          </div>

                          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                              <Link2 className="h-4 w-4 text-slate-500" />
                              Compartilhamento público
                            </div>
                            <p className="truncate text-xs text-slate-500">
                              {item.shareToken ? `/imovel/${item.shareToken}` : "Link ainda não gerado."}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 gap-2 rounded-2xl"
                                onClick={() => generateShareLink(item.id)}
                                disabled={mutating}
                              >
                                <Copy className="h-4 w-4" />
                                Gerar / copiar
                              </Button>
                              <Button
                                variant={item.shareEnabled ? "secondary" : "default"}
                                className="flex-1 gap-2 rounded-2xl"
                                onClick={() => toggleShare(item)}
                                disabled={mutating}
                              >
                                {item.shareEnabled ? <Unlink className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                                {item.shareEnabled ? "Desativar" : "Ativar"}
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" className="flex-1 gap-2 rounded-2xl" onClick={() => openDetails(item.id)}>
                              <Eye className="h-4 w-4" />
                              Detalhes
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2 rounded-2xl" onClick={() => setQuickNoteOpen(true)}>
                              <Wallet className="h-4 w-4" />
                              Nota rápida
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2 rounded-2xl" onClick={() => markStatus(item.id, item.status === "AVAILABLE" ? "RESERVED" : item.status === "RESERVED" ? "SOLD" : "AVAILABLE")}>
                              <CheckCircle2 className="h-4 w-4" />
                              Trocar status
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Resumo da carteira</CardTitle>
              <CardDescription>Leitura rápida do estoque e do desempenho comercial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SummaryRow label="Valor total da carteira" value={formatMoney(stats.totalValue)} />
              <SummaryRow label="Imóveis com link ativo" value={String(stats.shared)} />
              <SummaryRow label="Visualizações públicas" value={String(stats.totalViews)} />
              <SummaryRow label="Linha de força" value={featured ? `${typeLabel[featured.type]} • ${featured.city}` : "Sem destaque"} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 to-slate-900 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Detalhes do imóvel
                </div>
                <DialogTitle className="text-2xl text-white">{selected?.address ?? "Imóvel"}</DialogTitle>
                <DialogDescription className="mt-1 text-slate-300">
                  {selected ? [selected.neighborhood, selected.city, selected.state].filter(Boolean).join(" • ") : ""}
                </DialogDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selected && <Badge className={cn("rounded-full px-3 py-1 text-sm", statusMeta[selected.status].className)}>{statusMeta[selected.status].label}</Badge>}
                {selected?.shareEnabled && <Badge className="rounded-full border-emerald-200 bg-emerald-100 px-3 py-1 text-emerald-800">Link ativo</Badge>}
              </div>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 p-6">
              {detailLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-3xl" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : selected ? (
                <>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
                    <div className="grid gap-0 md:grid-cols-2">
                      {(selected.photos?.length ? selected.photos : [{ id: "fallback", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80", order: 0 }]).slice(0, 4).map((photo, index) => (
                        <div key={photo.id} className={cn("relative h-56 overflow-hidden", index === 0 && "md:col-span-2 md:h-72")}>
                          <img src={photo.url} alt={selected.address} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoBox label="Tipo" value={typeLabel[selected.type]} />
                    <InfoBox label="Área" value={selected.area ? `${selected.area} m²` : "—"} />
                    <InfoBox label="Preço" value={formatMoney(selected.price)} />
                    <InfoBox label="Comissão" value={formatMoney(selected.commission)} />
                    <InfoBox label="Views" value={String(selected.shareViews ?? 0)} />
                    <InfoBox label="Atualizado em" value={formatDate(selected.updatedAt)} />
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-2 text-sm font-semibold text-slate-900">Observações</div>
                    <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                      {selected.neighborhood ? `${selected.neighborhood}\n\n` : ""}
                      {selected.address}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 p-6 md:border-l md:border-t-0">
              {detailLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ) : selected ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Compartilhamento</h3>
                      <p className="text-sm text-slate-500">Controle total sobre o link público.</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="space-y-2">
                      <Label>Link público</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={selected.shareToken ? `${window.location.origin}/imovel/${selected.shareToken}` : "Link não gerado"} />
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (!selected.shareToken) return;
                            await navigator.clipboard.writeText(`${window.location.origin}/imovel/${selected.shareToken}`);
                            setShareMessage("Link copiado para a área de transferência");
                          }}
                          disabled={!selected.shareToken}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button className="gap-2" onClick={() => generateShareLink(selected.id)} disabled={mutating}>
                        <Link2 className="h-4 w-4" />
                        Gerar / renovar
                      </Button>
                      <Button variant={selected.shareEnabled ? "secondary" : "default"} className="gap-2" onClick={() => toggleShare(selected)} disabled={mutating}>
                        {selected.shareEnabled ? <Unlink className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                        {selected.shareEnabled ? "Desativar" : "Ativar"}
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniStat label="Acessos públicos" value={String(selected.shareViews ?? 0)} />
                      <MiniStat label="Estado do link" value={selected.shareEnabled ? "Ativo" : "Inativo"} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h4 className="font-semibold text-slate-950">Ações rápidas</h4>
                    <div className="grid gap-2">
                      <Button variant="outline" className="justify-start gap-2 rounded-2xl" onClick={() => markStatus(selected.id, "AVAILABLE")}>
                        <CheckCircle2 className="h-4 w-4" />
                        Marcar como disponível
                      </Button>
                      <Button variant="outline" className="justify-start gap-2 rounded-2xl" onClick={() => markStatus(selected.id, "RESERVED")}>
                        <CalendarDays className="h-4 w-4" />
                        Reservar imóvel
                      </Button>
                      <Button variant="outline" className="justify-start gap-2 rounded-2xl" onClick={() => markStatus(selected.id, "SOLD")}>
                        <XCircle className="h-4 w-4" />
                        Marcar como vendido
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {shareMessage && (
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-sm text-slate-600">
              {shareMessage}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={quickNoteOpen} onOpenChange={setQuickNoteOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Observação rápida</DialogTitle>
            <DialogDescription>Use esse bloco para deixar uma nota relevante diretamente no imóvel.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea value={quickNote} onChange={(e) => setQuickNote(e.target.value)} rows={5} placeholder="Ex.: imóvel com ótima iluminação natural..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setQuickNoteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => selected && addQuickNote(selected.id)} disabled={mutating || !quickNote.trim()}>
              Salvar observação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

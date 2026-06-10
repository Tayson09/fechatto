"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Eye,
  Home,
  ListTodo,
  Search,
  TrendingUp,
  User2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const periodFilters = [
  { label: "Este mês", value: "monthly" as const },
  { label: "Trimestre", value: "quarterly" as const },
  { label: "Ano", value: "yearly" as const },
];

type DashboardPeriod = "monthly" | "quarterly" | "yearly";

type DashboardData = {
  period: DashboardPeriod;
  totalActiveClients: number;
  totalAvailableProperties: number;
  openNegotiations: number;
  closedNegotiations: number;
  closedNegotiationsTotal: number;
  lostNegotiations?: number;
  totalNegotiations: number;
  forecastCommission: number;
  generatedCommission: number;
  totalCommission: number;
  averageCommission: number;
  conversionRate: number;
  monthlyCommissionSeries: Array<{ month: string; value: number }>;
  funnel: Array<{ stage: string; value: number }>;
  followUps: Array<{ name: string; when: string; status: string }>;
  followUpsTotalCount: number;
  topProperties: Array<{ id: string; name: string; meta: string; status: string; views: number }>;
  topPropertiesTotalViews: number;
  conversionData: Array<{ name: string; value: number }>;
  overdueFollowUps?: number;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("pt-BR");

const COLORS = ["#0b2f5b", "#d8e2ef"];

function formatThousandsLabel(value: number | string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return `${Math.round(numeric / 1000)}K`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function propertyStatusLabel(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: "Disponível",
    RESERVED: "Reservado",
    SOLD: "Vendido",
  };
  return map[status] ?? status;
}

function buildCommissionTicks(maxValue: number) {
  const safeMax = Math.max(1000, maxValue);
  const step = safeMax <= 5000 ? 1000 : safeMax <= 20000 ? 4000 : Math.ceil(safeMax / 5 / 1000) * 1000;
  const top = Math.ceil(safeMax / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top; value += step) ticks.push(value);
  if (ticks[ticks.length - 1] !== top) ticks.push(top);
  return { top, ticks };
}

function buildFunnelTicks(maxValue: number) {
  const safeMax = Math.max(5, Math.ceil(maxValue));

  let step = 5;
  if (safeMax > 500) step = 100;
  else if (safeMax > 250) step = 50;
  else if (safeMax > 100) step = 20;
  else if (safeMax > 50) step = 10;

  const top = Math.ceil(safeMax / step) * step;
  const ticks: number[] = [];

  for (let value = 0; value <= top; value += step) {
    ticks.push(value);
  }

  if (ticks[ticks.length - 1] !== top) ticks.push(top);

  return { top, ticks };
}


function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  change,
  headerAccessory,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  headerAccessory?: React.ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/80 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          {headerAccessory ? <div className="shrink-0">{headerAccessory}</div> : null}
        </div>
        <p className="mt-3 text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        {change ? (
          <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50">
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            {change}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}


function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<DashboardPeriod>("monthly");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showOverdueDetails, setShowOverdueDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const searchParam = search.trim();
        const response = await fetch(
          `/api/dashboard?period=${activeFilter}${searchParam ? `&search=${encodeURIComponent(searchParam)}` : ""}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Não foi possível carregar o dashboard");
        }

        if (!cancelled) {
          setData(payload.data as DashboardData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar os dados");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeFilter, search]);

  const headerSubtitle = useMemo(() => {
    if (activeFilter === "quarterly") return "Resumo consolidado do trimestre";
    if (activeFilter === "yearly") return "Visão anual da operação";
    return "Indicadores em tempo real do mês";
  }, [activeFilter, search]);

  const normalizedSearch = useMemo(() => normalizeText(search.trim()), [search]);

  const overdueFollowUpsList = useMemo(() => {
    if (!data?.followUps) return [];
    return data.followUps.filter((item) => item.status === "Atrasado");
  }, [data?.followUps]);

  const filteredFollowUps = useMemo(() => {
    if (!data?.followUps) return [];
    if (!normalizedSearch) return data.followUps;
    return data.followUps.filter((item) =>
      [item.name, item.when, item.status].some((value) => normalizeText(value).includes(normalizedSearch))
    );
  }, [data?.followUps, normalizedSearch]);

  const filteredProperties = useMemo(() => {
    if (!data?.topProperties) return [];
    if (!normalizedSearch) return data.topProperties;
    return data.topProperties.filter((item) =>
      [item.name, item.meta, item.status].some((value) => normalizeText(value).includes(normalizedSearch))
    );
  }, [data?.topProperties, normalizedSearch]);

  const visibleFollowUps = filteredFollowUps.slice(0, 3);
  const visibleProperties = filteredProperties.slice(0, 3);
  const monthlyScale = useMemo(() => {
    const maxValue = Math.max(0, ...(data?.monthlyCommissionSeries?.map((item) => item.value) ?? []));
    return buildCommissionTicks(maxValue);
  }, [data?.monthlyCommissionSeries]);

  const funnelScale = useMemo(() => {
    const maxValue = Math.max(0, ...(data?.funnel?.map((item) => item.value) ?? []));
    return buildFunnelTicks(maxValue);
  }, [data?.funnel]);

  const conversionLabel = data ? `${data.conversionRate.toFixed(1)}%` : "0%";
  const followUpsToday = data?.followUps.filter((item) => item.status === "Hoje").length ?? 0;
  const overdueFollowUps = overdueFollowUpsList.length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Dashboard analítico</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Painel de desempenho comercial
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{headerSubtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, imóvel ou status"
              className="h-11 rounded-2xl border-slate-200 bg-white pl-10 shadow-sm"
            />
          </div>
          <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
            {periodFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveFilter(item.value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === item.value
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>{overdueFollowUps} follow-up(s) atrasado(s)</strong> — confira os contatos pendentes.
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-xl px-3 text-amber-900 hover:bg-amber-100"
            onClick={() => setShowOverdueDetails((current) => !current)}
          >
            {showOverdueDetails ? "Ocultar detalhes" : "Ver detalhes"}
          </Button>
        </div>
      </div>

      {showOverdueDetails ? (
        <Card className="rounded-[28px] border-amber-200 bg-amber-50/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-950">Follow-ups atrasados</CardTitle>
            <CardDescription>Contatos que precisam de retorno imediato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueFollowUpsList.length === 0 ? (
              <p className="text-sm text-amber-900/70">Nenhum follow-up atrasado no momento.</p>
            ) : (
              overdueFollowUpsList.map((item, index) => (
                <div key={`${item.name}-${index}`} className="rounded-2xl border border-amber-200 bg-white p-3">
                  <p className="font-medium text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.when}</p>
                  <div className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                    {item.status}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          title="Comissão total"
          value={loading || !data ? "—" : currency.format(data.generatedCommission)}
          subtitle=""
          headerAccessory={
            loading || !data ? null : (
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                {integer.format(data.closedNegotiationsTotal)} vendas
              </div>
            )
          }
        />
        <MetricCard
          icon={TrendingUp}
          title="Comissão prevista"
          value={loading || !data ? "—" : currency.format(data.forecastCommission)}
          subtitle=""
        />
        <MetricCard
          icon={Bell}
          title="Follow-ups hoje"
          value={loading || !data ? "—" : integer.format(followUpsToday)}
          subtitle=""
        />
        <MetricCard
          icon={Building2}
          title="Imóveis disponíveis"
          value={loading || !data ? "—" : integer.format(data.totalAvailableProperties)}
          subtitle=""
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comissão mensal</CardTitle>
            <CardDescription>Últimos 6 meses · R$</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? (
              <EmptyPanel message="Carregando dados do banco..." />
            ) : data?.monthlyCommissionSeries?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyCommissionSeries} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    ticks={monthlyScale.ticks}
                    domain={[0, monthlyScale.top]}
                    tickFormatter={formatThousandsLabel}
                    allowDecimals={false}
                  />
                  <Tooltip formatter={(value) => currency.format(Number(value ?? 0))} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#b7d0e8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel message="Sem negociações fechadas no período selecionado." />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Funil de clientes</CardTitle>
            <CardDescription>Distribuição por etapa</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? (
              <EmptyPanel message="Carregando dados do banco..." />
            ) : data?.funnel?.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnel} layout="vertical" barSize={22} margin={{ left: 6, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    ticks={funnelScale.ticks}
                    domain={[0, funnelScale.top]}
                    allowDecimals={false}
                  />
                  <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} width={84} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#7aa8c8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full overflow-hidden">
                <EmptyPanel message="Ainda não há clientes cadastrados para montar o funil." />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Follow-ups pendentes</CardTitle>
                <CardDescription>agenda do momento</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {loading || !data ? "..." : `${integer.format(data.followUpsTotalCount)} itens`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Carregando...
              </div>
            ) : visibleFollowUps.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum follow-up para mostrar.</p>
            ) : (
              visibleFollowUps.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className={`flex items-start justify-between gap-3 rounded-2xl border p-3 ${
                    index === visibleFollowUps.length - 1 ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.when}</p>
                  </div>
                  <Badge
                    className={`rounded-full ${
                      item.status === "Atrasado"
                        ? "bg-red-50 text-red-600 hover:bg-red-50"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Imóveis mais vistos</CardTitle>
                <CardDescription>link público</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {loading || !data ? "..." : `${integer.format(data.topPropertiesTotalViews)} views`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Carregando...
              </div>
            ) : visibleProperties.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum imóvel compartilhado encontrado.</p>
            ) : (
              visibleProperties.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                  <div>
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.meta}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <Eye className="h-3.5 w-3.5" />
                    {item.views}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Taxa de conversão</CardTitle>
            <CardDescription>negociações encerradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              {loading ? (
                <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">Carregando...</div>
              ) : data?.conversionData?.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={data.conversionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={66}
                      outerRadius={88}
                      strokeWidth={0}
                    >
                      {data.conversionData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label value={conversionLabel} position="center" className="fill-slate-950 text-3xl font-semibold" />
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
                  Sem dados de conversão para mostrar.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atalhos operacionais</CardTitle>
            <CardDescription>ações rápidas para o dia a dia</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Novo cliente", User2],
              ["Novo imóvel", Home],
              ["Agendar visita", CalendarClock],
              ["Criar lembrete", ListTodo],
            ].map(([label, Icon]) => (
              <button
                key={label as string}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {React.createElement(Icon as React.ElementType, { className: "h-4 w-4" })}
                </span>
                <span className="text-sm font-medium text-slate-950">{label as string}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo rápido</CardTitle>
            <CardDescription>principais sinais do painel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Comissão prevista do período", loading || !data ? "—" : currency.format(data.forecastCommission)],
              ["Negociações ativas", loading || !data ? "—" : integer.format(data.openNegotiations)],
              ["Follow-ups atrasados", loading || !data ? "—" : integer.format(overdueFollowUps)],
              ["Clientes em atendimento", loading || !data ? "—" : integer.format(data.totalActiveClients)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-slate-950">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

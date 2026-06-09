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
  LayoutDashboard,
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

const periodFilters = ["Este mês", "Trimestre", "Ano"];

const periodMap: Record<string, string> = {
  "Este mês": "monthly",
  Trimestre: "quarterly",
  Ano: "yearly",
};

const commissionData = [
  { month: "Jan", value: 8.2 },
  { month: "Fev", value: 6.3 },
  { month: "Mar", value: 10.9 },
  { month: "Abr", value: 9.4 },
  { month: "Mai", value: 14.1 },
  { month: "Jun", value: 12.7 },
];

const funnelData = [
  { stage: "Lead", value: 19 },
  { stage: "Atendimento", value: 15 },
  { stage: "Proposta", value: 8 },
  { stage: "Visita", value: 5 },
  { stage: "Fechado", value: 12 },
  { stage: "Perdido", value: 6 },
];

const staticProperties = [
  { name: "Apto. Meireles 3Q", meta: "Apartamento · R$ 480k", views: 124 },
  { name: "Casa Aldeota", meta: "Casa · R$ 890k", views: 87 },
  { name: "Terreno Eusébio", meta: "Terreno · R$ 220k", views: 63 },
];

const conversionData = [
  { name: "Fechadas", value: 12 },
  { name: "Perdidas", value: 6 },
];

const COLORS = ["#0b2f5b", "#d8e2ef"];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type DashboardMetrics = {
  totalAvailableProperties: number;
  openNegotiations: number;
  forecastCommission: number;
  generatedCommission: number;
  averageCommission: number;
  conversionRate: number;
};

type OverdueClient = {
  id: string;
  name: string;
  nextFollowUp: string | null;
  status: string;
};

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  change,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  change?: string;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/80 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {change ? (
            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              {change}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("Este mês");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [overdues, setOverdues] = useState<OverdueClient[]>([]);

  const headerSubtitle = useMemo(() => {
    if (activeFilter === "Trimestre") return "Resumo consolidado do trimestre";
    if (activeFilter === "Ano") return "Visão anual de performance comercial";
    return "Visão geral do mês com indicadores em tempo real";
  }, [activeFilter]);

  useEffect(() => {
    const period = periodMap[activeFilter] ?? "monthly";
    fetch(`/api/dashboard?period=${period}`)
      .then((r) => r.json())
      .then(({ data }) => setMetrics(data))
      .catch(console.error);
  }, [activeFilter]);

  useEffect(() => {
    fetch("/api/follow-ups")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data)) setOverdues(data);
      })
      .catch(console.error);
  }, []);

  const overdueCount = overdues.length;
  const overdueNames = overdues
    .slice(0, 2)
    .map((c) => c.name)
    .join(" e ");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Visão geral</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard executivo
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{headerSubtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar cliente, imóvel ou negociação"
              className="h-11 rounded-2xl border-slate-200 bg-white pl-10 shadow-sm"
            />
          </div>
          <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
            {periodFilters.map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === item
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {overdueCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>
                  {overdueCount} follow-up{overdueCount > 1 ? "s" : ""} atrasado{overdueCount > 1 ? "s" : ""}
                </strong>
                {overdueNames ? ` — ${overdueNames} precisam de contato urgente.` : "."}
              </span>
            </div>
            <Button variant="ghost" className="h-8 rounded-xl px-3 text-amber-900 hover:bg-amber-100">
              Ver detalhes
            </Button>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          title="Comissão realizada"
          value={metrics ? currency.format(metrics.generatedCommission) : "—"}
          subtitle="Negociações fechadas no período"
        />
        <MetricCard
          icon={TrendingUp}
          title="Comissão prevista"
          value={metrics ? currency.format(metrics.forecastCommission) : "—"}
          subtitle={
            metrics ? `em ${metrics.openNegotiations} negociações ativas` : "negociações ativas"
          }
        />
        <MetricCard
          icon={Bell}
          title="Follow-ups atrasados"
          value={String(overdueCount)}
          subtitle={overdueCount > 0 ? "clientes aguardando contato" : "nenhum atrasado"}
        />
        <MetricCard
          icon={Building2}
          title="Imóveis disponíveis"
          value={metrics ? String(metrics.totalAvailableProperties) : "—"}
          subtitle="com status disponível"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comissão mensal</CardTitle>
            <CardDescription>Últimos 6 meses · R$</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}k`} />
                <Tooltip formatter={(value) => `R$ ${value ?? 0}k`} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#b7d0e8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Funil de clientes</CardTitle>
            <CardDescription>Distribuição por etapa</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" barSize={22} margin={{ left: 6, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} width={84} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#7aa8c8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Follow-ups pendentes</CardTitle>
                <CardDescription>contatos atrasados</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {overdueCount} {overdueCount === 1 ? "item" : "itens"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdueCount === 0 ? (
              <p className="text-sm text-slate-500">Nenhum follow-up atrasado.</p>
            ) : (
              overdues.slice(0, 4).map((client) => (
                <div
                  key={client.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <div>
                    <p className="font-medium text-slate-950">{client.name}</p>
                    <p className="text-sm text-slate-500">
                      {client.nextFollowUp
                        ? new Date(client.nextFollowUp).toLocaleDateString("pt-BR")
                        : "Sem data definida"}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-red-50 text-red-600 hover:bg-red-50">
                    Atrasado
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
                total de views
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {staticProperties.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div>
                  <p className="font-medium text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.meta}</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  <Eye className="h-3.5 w-3.5" />
                  {item.views}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Taxa de conversão</CardTitle>
            <CardDescription>negociações encerradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={66}
                    outerRadius={88}
                    strokeWidth={0}
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                      value={metrics ? `${metrics.conversionRate.toFixed(0)}%` : "—"}
                      position="center"
                      className="fill-slate-950 text-3xl font-semibold"
                    />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
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
            {(
              [
                ["Comissão prevista do período", metrics ? currency.format(metrics.forecastCommission) : "—"],
                ["Negociações ativas", metrics ? String(metrics.openNegotiations) : "—"],
                ["Imóveis disponíveis", metrics ? String(metrics.totalAvailableProperties) : "—"],
                ["Follow-ups atrasados", String(overdueCount)],
              ] as [string, string][]
            ).map(([label, value]) => (
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

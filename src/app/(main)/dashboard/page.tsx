"use client";

import React, { useMemo, useState } from "react";
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

const followUps = [
  { name: "Carlos Mendes", when: "Ontem · não contatado", status: "Atrasado" },
  { name: "Ana Lima", when: "Ontem · não contatado", status: "Atrasado" },
  { name: "Pedro Santos", when: "Hoje · 14:00", status: "Hoje" },
  { name: "Mariana Costa", when: "Hoje · 17:30", status: "Hoje" },
];

const properties = [
  { name: "Apto. Meireles 3Q", meta: "Apartamento · R$ 480k", views: 124 },
  { name: "Casa Aldeota", meta: "Casa · R$ 890k", views: 87 },
  { name: "Terreno Eusébio", meta: "Terreno · R$ 220k", views: 63 },
];

const conversionData = [
  { name: "Fechadas", value: 12 },
  { name: "Perdidas", value: 6 },
];

const COLORS = ["#0b2f5b", "#d8e2ef"];

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

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("Este mês");

  const headerSubtitle = useMemo(() => {
    if (activeFilter === "Trimestre") return "Resumo consolidado do trimestre";
    if (activeFilter === "Ano") return "Visão anual de performance comercial";
    return "Visão geral do mês com indicadores em tempo real";
  }, [activeFilter]);

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

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>2 follow-ups atrasados</strong> — Carlos Mendes e Ana Lima precisam de contato urgente.
            </span>
          </div>
          <Button variant="ghost" className="h-8 rounded-xl px-3 text-amber-900 hover:bg-amber-100">
            Ver detalhes
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          title="Comissão realizada"
          value="R$ 12.750"
          subtitle="↑ 18% vs mês anterior"
          change="18%"
        />
        <MetricCard
          icon={TrendingUp}
          title="Comissão prevista"
          value="R$ 18.400"
          subtitle="em 7 negociações ativas"
        />
        <MetricCard
          icon={Bell}
          title="Follow-ups hoje"
          value="4"
          subtitle="2 atrasados"
        />
        <MetricCard
          icon={Building2}
          title="Imóveis disponíveis"
          value="14"
          subtitle="3 reservados"
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
                <CardDescription>agenda de hoje</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full">
                4 itens
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {followUps.map((item, index) => (
              <div
                key={item.name}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-3 ${
                  index === followUps.length - 1 ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"
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
            ))}
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
            {properties.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3">
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
                    <Label value="67%" position="center" className="fill-slate-950 text-3xl font-semibold" />
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
            {[
              ["Comissão prevista do mês", "R$ 18.400"],
              ["Negociações ativas", "7"],
              ["Visitas agendadas", "9"],
              ["Clientes em atendimento", "18"],
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


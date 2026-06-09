import Link from "next/link";
import { redirect } from "next/navigation";
import type { ElementType } from "react";
import { getServerSession } from "next-auth";
import { ArrowUpRight, CalendarDays, CircleDollarSign, Percent, Target } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { CommissionRepository } from "@/server/repositories/commission.repository";
import { CommissionService } from "@/server/services/commission.service";
import { CommissionPeriodSchema, type CommissionPeriod } from "@/server/validators/commission.schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const service = new CommissionService(new CommissionRepository());

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const periodOptions: Array<{ label: string; value: CommissionPeriod }> = [
  { label: "Mensal", value: "monthly" },
  { label: "Trimestral", value: "quarterly" },
  { label: "Anual", value: "yearly" },
];

function resolvePeriod(value?: string): CommissionPeriod {
  const parsed = CommissionPeriodSchema.safeParse(value ?? "monthly");
  return parsed.success ? parsed.data : "monthly";
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: ElementType;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
      <CardContent className="p-5">
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function readSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

type DemoDeal = {
  id: string;
  closedAt: string | null;
  commission: number;
  client: { name: string };
  property: { address: string; city: string };
};

type DemoReport = {
  totalCommission: number;
  closedNegotiations: number;
  forecastCommission: number;
  conversionRate: number;
  totalActiveClients: number;
  totalAvailableProperties: number;
  openNegotiations: number;
  averageCommission: number;
  deals: DemoDeal[];
};

const demoReports: Record<CommissionPeriod, DemoReport> = {
  monthly: {
    totalCommission: 12750,
    closedNegotiations: 8,
    forecastCommission: 18400,
    conversionRate: 42.1,
    totalActiveClients: 24,
    totalAvailableProperties: 14,
    openNegotiations: 11,
    averageCommission: 1593.75,
    deals: [
      {
        id: "demo-1",
        closedAt: new Date().toISOString(),
        commission: 4200,
        client: { name: "Carlos Mendes" },
        property: { address: "Rua das Acácias, 120", city: "Fortaleza" },
      },
      {
        id: "demo-2",
        closedAt: new Date().toISOString(),
        commission: 3650,
        client: { name: "Ana Lima" },
        property: { address: "Av. Beira Mar, 845", city: "Fortaleza" },
      },
      {
        id: "demo-3",
        closedAt: new Date().toISOString(),
        commission: 4900,
        client: { name: "Pedro Santos" },
        property: { address: "Condomínio Vila Azul", city: "Eusébio" },
      },
    ],
  },
  quarterly: {
    totalCommission: 38600,
    closedNegotiations: 21,
    forecastCommission: 53100,
    conversionRate: 46.7,
    totalActiveClients: 31,
    totalAvailableProperties: 17,
    openNegotiations: 14,
    averageCommission: 1838.1,
    deals: [
      {
        id: "demo-q1",
        closedAt: new Date().toISOString(),
        commission: 9200,
        client: { name: "Juliana Rocha" },
        property: { address: "Rua Coronel Jucá, 310", city: "Fortaleza" },
      },
      {
        id: "demo-q2",
        closedAt: new Date().toISOString(),
        commission: 11100,
        client: { name: "Ricardo Alves" },
        property: { address: "Av. Washington Soares, 2200", city: "Fortaleza" },
      },
      {
        id: "demo-q3",
        closedAt: new Date().toISOString(),
        commission: 18300,
        client: { name: "Fernanda Lima" },
        property: { address: "Condomínio Jardins", city: "Caucaia" },
      },
    ],
  },
  yearly: {
    totalCommission: 148900,
    closedNegotiations: 86,
    forecastCommission: 174500,
    conversionRate: 49.3,
    totalActiveClients: 94,
    totalAvailableProperties: 28,
    openNegotiations: 23,
    averageCommission: 1731.39,
    deals: [
      {
        id: "demo-y1",
        closedAt: new Date().toISOString(),
        commission: 24200,
        client: { name: "Paulo Henrique" },
        property: { address: "Avenida Santos Dumont, 500", city: "Fortaleza" },
      },
      {
        id: "demo-y2",
        closedAt: new Date().toISOString(),
        commission: 31700,
        client: { name: "Marina Torres" },
        property: { address: "Rua Silva Paulet, 780", city: "Fortaleza" },
      },
      {
        id: "demo-y3",
        closedAt: new Date().toISOString(),
        commission: 28500,
        client: { name: "Gabriel Nunes" },
        property: { address: "Condomínio Laguna", city: "Eusébio" },
      },
    ],
  },
};

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string | string[] }> | { period?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const period = resolvePeriod(readSingle(resolvedSearchParams?.period));

  let report = demoReports[period];
  let demoMode = true;

  try {
    const raw = await service.getCommissionReport(session.user.id, period);
    const hasRealData =
      raw.deals.length > 0 ||
      raw.totalCommission > 0 ||
      raw.closedNegotiations > 0 ||
      raw.forecastCommission > 0 ||
      raw.totalActiveClients > 0 ||
      raw.totalAvailableProperties > 0 ||
      raw.openNegotiations > 0;

    if (hasRealData) {
      report = raw;
      demoMode = false;
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">
            Painel de comissões
          </Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Comissões e negócios concluídos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Visão financeira do período com filtros mensal, trimestral e anual, totalizadores e lista dos fechamentos.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {periodOptions.map((option) => (
              <Link
                key={option.value}
                href={`/commissions?period=${option.value}`}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  period === option.value
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CircleDollarSign} title="Comissão total" value={currency.format(report.totalCommission)} subtitle="Comissão gerada no período selecionado." />
        <MetricCard icon={CalendarDays} title="Negócios concluídos" value={String(report.closedNegotiations)} subtitle="Fechamentos com status CLOSED_WON." />
        <MetricCard icon={Target} title="Previsão do pipeline" value={currency.format(report.forecastCommission)} subtitle="Comissões dos negócios em andamento." />
        <MetricCard icon={Percent} title="Conversão" value={`${report.conversionRate.toFixed(1)}%`} subtitle="Percentual de fechamentos sobre o total." />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Resumo financeiro</CardTitle>
            <CardDescription>Totalizadores do período filtrado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Clientes ativos</span>
              <strong className="text-slate-950">{report.totalActiveClients}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Imóveis disponíveis</span>
              <strong className="text-slate-950">{report.totalAvailableProperties}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Negociações em andamento</span>
              <strong className="text-slate-950">{report.openNegotiations}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Ticket médio por fechamento</span>
              <strong className="text-slate-950">{currency.format(report.averageCommission)}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Negócios concluídos</CardTitle>
            <CardDescription>Lista dos fechamentos com comissão snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto pt-0">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-medium">Cliente</th>
                  <th className="py-3 pr-4 font-medium">Imóvel</th>
                  <th className="py-3 pr-4 font-medium">Fechamento</th>
                  <th className="py-3 pr-4 font-medium">Comissão</th>
                </tr>
              </thead>
              <tbody>
                {report.deals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-slate-500">
                      Nenhuma negociação concluída para o período selecionado.
                    </td>
                  </tr>
                ) : (
                  report.deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-4 pr-4 font-medium text-slate-950">{deal.client.name}</td>
                      <td className="py-4 pr-4 text-slate-600">
                        {deal.property.address} · {deal.property.city}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {deal.closedAt ? new Date(deal.closedAt).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-950">{currency.format(deal.commission)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <div className="flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Filtro ativo</p>
          <p className="text-lg font-semibold text-slate-950">
            {periodOptions.find((item) => item.value === period)?.label ?? "Mensal"}
          </p>
        </div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Voltar ao dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

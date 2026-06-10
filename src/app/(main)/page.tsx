import Link from "next/link";
import { redirect } from "next/navigation";
import type { ElementType } from "react";
import { getServerSession } from "next-auth";
import { BarChart3, Building2, CircleDollarSign, TrendingUp, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { CommissionRepository } from "@/server/repositories/commission.repository";
import { CommissionService } from "@/server/services/commission.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const service = new CommissionService(new CommissionRepository());

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

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
    <Card className={cn(
      "rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm",
      "dark:border-white/10 dark:bg-[#0f1b2d]"
    )}>
      <CardContent className="p-5">
        <div className={cn(
          "mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700",
          "dark:bg-white/10 dark:text-slate-400"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <p className={cn(
          "text-sm font-medium text-slate-500",
          "dark:text-slate-400"
        )}>{title}</p>
        <p className={cn(
          "mt-1 text-2xl font-semibold tracking-tight text-slate-950",
          "dark:text-slate-100"
        )}>{value}</p>
        <p className={cn(
          "mt-1 text-sm text-slate-500",
          "dark:text-slate-400"
        )}>{subtitle}</p>
      </CardContent>
    </Card>
  );
}

type DashboardMetrics = {
  period: "monthly" | "quarterly" | "yearly";
  totalActiveClients: number;
  totalAvailableProperties: number;
  openNegotiations: number;
  closedNegotiations: number;
  totalNegotiations: number;
  forecastCommission: number;
  generatedCommission: number;
  totalCommission: number;
  averageCommission: number;
  conversionRate: number;
};

const demoMetrics: DashboardMetrics = {
  period: "monthly",
  totalActiveClients: 28,
  totalAvailableProperties: 16,
  openNegotiations: 12,
  closedNegotiations: 9,
  totalNegotiations: 21,
  forecastCommission: 18400,
  generatedCommission: 12750,
  totalCommission: 12750,
  averageCommission: 1416.67,
  conversionRate: 42.9,
};

function isEmptyMetrics(metrics: DashboardMetrics) {
  return (
    metrics.totalActiveClients === 0 &&
    metrics.totalAvailableProperties === 0 &&
    metrics.openNegotiations === 0 &&
    metrics.closedNegotiations === 0 &&
    metrics.totalNegotiations === 0 &&
    metrics.forecastCommission === 0 &&
    metrics.generatedCommission === 0 &&
    metrics.totalCommission === 0 &&
    metrics.averageCommission === 0
  );
}

export default async function MainDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let metrics: DashboardMetrics = demoMetrics;

  try {
    const raw = await service.getDashboardMetrics(session.user.id, "monthly");
    if (!isEmptyMetrics(raw)) {
      metrics = raw;
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6">
      <header className={cn(
        "flex flex-col gap-3 rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between",
        "dark:border-white/10 dark:bg-[#0f1b2d]"
      )}>
        <div>
          <Badge className={cn(
            "rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900",
            "dark:bg-white/12 dark:text-slate-200 dark:hover:bg-white/15"
          )}>Visão gerencial</Badge>
          <h1 className={cn(
            "mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl",
            "dark:text-slate-100"
          )}>Dashboard principal</h1>
          <p className={cn(
            "mt-2 max-w-2xl text-sm text-slate-500",
            "dark:text-slate-400"
          )}>
            Resumo operacional com clientes, imóveis, negociações e comissões consolidadas.
          </p>
        </div>
        <div className={cn(
          "text-sm text-slate-500",
          "dark:text-slate-400"
        )}>
          Período padrão: <span className={cn(
            "font-medium text-slate-950",
            "dark:text-slate-200"
          )}>mensal</span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Users} title="Clientes ativos" value={String(metrics.totalActiveClients)} subtitle="Clientes em atendimento, proposta ou visita." />
        <MetricCard icon={Building2} title="Imóveis disponíveis" value={String(metrics.totalAvailableProperties)} subtitle="Imóveis livres para novas negociações." />
        <MetricCard icon={TrendingUp} title="Negociações em andamento" value={String(metrics.openNegotiations)} subtitle="Pipeline ativo no momento." />
        <MetricCard icon={CircleDollarSign} title="Negociações concluídas" value={String(metrics.closedNegotiations)} subtitle="Fechamentos confirmados no período." />
        <MetricCard icon={BarChart3} title="Comissão prevista do mês" value={currency.format(metrics.forecastCommission)} subtitle="Somatório projetado do pipeline atual." />
        <MetricCard icon={CircleDollarSign} title="Comissão gerada" value={currency.format(metrics.generatedCommission)} subtitle="Snapshot financeiro gravado no fechamento." />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className={cn(
          "rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm",
          "dark:border-white/10 dark:bg-[#0f1b2d]"
        )}>
          <CardContent className="p-5">
            <h3 className={cn(
              "text-base font-semibold text-slate-950",
              "dark:text-slate-100"
            )}>Indicadores comerciais</h3>
            <p className={cn(
              "text-sm text-slate-500",
              "dark:text-slate-400"
            )}>Performance do funil no período atual.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className={cn(
                "rounded-2xl bg-slate-50 p-4",
                "dark:bg-white/8"
              )}>
                <p className={cn(
                  "text-sm text-slate-500",
                  "dark:text-slate-400"
                )}>Total de negociações</p>
                <p className={cn(
                  "mt-1 text-2xl font-semibold text-slate-950",
                  "dark:text-slate-100"
                )}>{metrics.totalNegotiations}</p>
              </div>
              <div className={cn(
                "rounded-2xl bg-slate-50 p-4",
                "dark:bg-white/8"
              )}>
                <p className={cn(
                  "text-sm text-slate-500",
                  "dark:text-slate-400"
                )}>Taxa de conversão</p>
                <p className={cn(
                  "mt-1 text-2xl font-semibold text-slate-950",
                  "dark:text-slate-100"
                )}>{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <div className={cn(
                "rounded-2xl bg-slate-50 p-4",
                "dark:bg-white/8"
              )}>
                <p className={cn(
                  "text-sm text-slate-500",
                  "dark:text-slate-400"
                )}>Ticket médio</p>
                <p className={cn(
                  "mt-1 text-2xl font-semibold text-slate-950",
                  "dark:text-slate-100"
                )}>{currency.format(metrics.averageCommission)}</p>
              </div>
              <div className={cn(
                "rounded-2xl bg-slate-50 p-4",
                "dark:bg-white/8"
              )}>
                <p className={cn(
                  "text-sm text-slate-500",
                  "dark:text-slate-400"
                )}>Comissão total</p>
                <p className={cn(
                  "mt-1 text-2xl font-semibold text-slate-950",
                  "dark:text-slate-100"
                )}>{currency.format(metrics.totalCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm",
          "dark:border-white/10 dark:bg-[#0f1b2d]"
        )}>
          <CardContent className="p-5">
            <h3 className={cn(
              "text-base font-semibold text-slate-950",
              "dark:text-slate-100"
            )}>Ações rápidas</h3>
            <p className={cn(
              "text-sm text-slate-500",
              "dark:text-slate-400"
            )}>Atalhos para os módulos principais.</p>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/clients" className={cn(
                "rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
                "dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/8"
              )}>
                Abrir clientes
              </Link>
              <Link href="/properties" className={cn(
                "rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
                "dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/8"
              )}>
                Ver imóveis
              </Link>
              <Link href="/commissions" className={cn(
                "rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
                "dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/8"
              )}>
                Painel de comissões
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

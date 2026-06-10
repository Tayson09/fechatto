import { prisma } from "@/lib/prisma";
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  isSameDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from "date-fns";
import type { CommissionPeriod } from "../validators/commission.schema";

function getPeriodBounds(period: CommissionPeriod, baseDate = new Date()) {
  switch (period) {
    case "quarterly":
      return { start: startOfQuarter(baseDate), end: endOfQuarter(baseDate) };
    case "yearly":
      return { start: startOfYear(baseDate), end: endOfYear(baseDate) };
    default:
      return { start: startOfMonth(baseDate), end: endOfMonth(baseDate) };
  }
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function formatMonthLabel(date: Date) {
  return date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .replace(/^./, (char) => char.toUpperCase());
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function propertyStatusLabel(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: "Disponível",
    RESERVED: "Reservado",
    SOLD: "Vendido",
  };
  return map[status] ?? status;
}

function propertyTypeLabel(type: string) {
  const map: Record<string, string> = {
    HOUSE: "Casa",
    APARTMENT: "Apartamento",
    LAND: "Terreno",
    COMMERCIAL: "Comercial",
  };
  return map[type] ?? type;
}

function matchesSearch(parts: Array<string | number | null | undefined>, search: string) {
  if (!search) return true;
  const normalizedSearch = normalizeText(search);
  return parts.some((part) => normalizeText(String(part ?? "")).includes(normalizedSearch));
}

function getEffectiveCommission(
  deal: { commission: unknown; property?: { commission?: unknown } },
) {
  const negotiationCommission = toNumber(deal.commission);
  if (Number.isFinite(negotiationCommission) && negotiationCommission > 0) {
    return negotiationCommission;
  }

  return toNumber(deal.property?.commission);
}

export class CommissionRepository {
  getPeriodBounds(period: CommissionPeriod, baseDate = new Date()) {
    return getPeriodBounds(period, baseDate);
  }

  async listClosedDeals(userId: string, period: CommissionPeriod) {
    const { start, end } = getPeriodBounds(period);

    const deals = await prisma.negotiation.findMany({
      where: {
        userId,
        status: "CLOSED_WON",
      },
      select: {
        id: true,
        closedAt: true,
        createdAt: true,
        updatedAt: true,
        commission: true,
        notes: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            type: true,
            address: true,
            city: true,
            price: true,
            commission: true,
          },
        },
      },
      orderBy: { closedAt: "desc" },
    });

    return deals
      .filter((deal) => {
        const effectiveDate = deal.closedAt ?? deal.updatedAt ?? deal.createdAt;
        return effectiveDate >= start && effectiveDate <= end;
      })
      .map((deal) => ({
        id: deal.id,
        closedAt: deal.closedAt?.toISOString() ?? null,
        commission: getEffectiveCommission(deal),
        notes: deal.notes,
        client: {
          id: deal.client.id,
          name: deal.client.name,
        },
        property: {
          id: deal.property.id,
          type: deal.property.type,
          address: deal.property.address,
          city: deal.property.city,
          price: toNumber(deal.property.price),
          commission: toNumber(deal.property.commission),
        },
      }));
  }

  async getDashboardMetrics(userId: string, period: CommissionPeriod, search = "") {
    const { start, end } = getPeriodBounds(period);
    const now = new Date();
    const normalizedSearch = search.trim();

    const [
      activeClients,
      availableProperties,
      openNegotiations,
      closedWonNegotiations,
      closedLostNegotiations,
      totalNegotiations,
      forecastDeals,
      clientStatusCounts,
      followUpClients,
      allProperties,
      closedWonDeals,
    ] = await Promise.all([
      prisma.client.count({
        where: { userId, deletedAt: null, status: { notIn: ["CLOSED", "LOST"] } },
      }),
      prisma.property.count({
        where: { userId, deletedAt: null, status: "AVAILABLE" },
      }),
      prisma.negotiation.count({
        where: { userId, status: "IN_PROGRESS" },
      }),
      prisma.negotiation.count({
        where: { userId, status: "CLOSED_WON", closedAt: { gte: start, lte: end } },
      }),
      prisma.negotiation.count({
        where: { userId, status: "CLOSED_LOST", closedAt: { gte: start, lte: end } },
      }),
      prisma.negotiation.count({
        where: { userId, createdAt: { gte: start, lte: end } },
      }),
      prisma.negotiation.findMany({
        where: {
          userId,
          status: "IN_PROGRESS",
          createdAt: { gte: start, lte: end },
        },
        select: {
          property: {
            select: {
              commission: true,
            },
          },
        },
      }),
      prisma.client.groupBy({
        by: ["status"],
        where: { userId, deletedAt: null },
        _count: { status: true },
      }),
      prisma.client.findMany({
        where: {
          userId,
          deletedAt: null,
          nextFollowUp: { not: null },
          status: { notIn: ["CLOSED", "LOST"] },
        },
        select: {
          name: true,
          nextFollowUp: true,
          status: true,
        },
        orderBy: {
          nextFollowUp: "asc",
        },
      }),
      prisma.property.findMany({
        where: { userId, deletedAt: null },
        orderBy: [
          { shareViews: "desc" },
          { updatedAt: "desc" },
        ],
        select: {
          id: true,
          type: true,
          address: true,
          city: true,
          price: true,
          status: true,
          shareViews: true,
        },
      }),
      prisma.negotiation.findMany({
        where: { userId, status: "CLOSED_WON" },
        select: {
          commission: true,
          notes: true,
          closedAt: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              name: true,
            },
          },
          property: {
            select: {
              type: true,
              address: true,
              city: true,
              commission: true,
            },
          },
        },
      }),
    ]);

    const forecastCommission = forecastDeals.reduce((sum, item) => sum + toNumber(item.property.commission), 0);
    const conversionRate = totalNegotiations > 0 ? (closedWonNegotiations / totalNegotiations) * 100 : 0;

    const effectiveClosedWonDeals = closedWonDeals.map((deal) => ({
      ...deal,
      effectiveCommission: getEffectiveCommission(deal),
      effectiveDate: deal.closedAt ?? deal.updatedAt ?? deal.createdAt,
      searchText: [
        deal.client.name,
        deal.property.address,
        deal.property.city,
        deal.property.type,
        deal.notes,
        deal.closedAt ? format(deal.closedAt, "dd/MM/yyyy") : null,
        deal.closedAt ? format(deal.closedAt, "yyyy-MM") : null,
        deal.commission,
        deal.property.commission,
      ],
    }));

    const effectiveClosedWonDealsFiltered = normalizedSearch
      ? effectiveClosedWonDeals.filter((deal) => matchesSearch(deal.searchText, normalizedSearch))
      : effectiveClosedWonDeals;

    const closedWonInPeriod = effectiveClosedWonDealsFiltered.filter((deal) => {
      const effectiveDate = deal.effectiveDate;
      return effectiveDate >= start && effectiveDate <= end;
    });

    const dashboardClosedWonDeals = effectiveClosedWonDealsFiltered;

    const generatedCommission = dashboardClosedWonDeals.reduce((sum, deal) => sum + deal.effectiveCommission, 0);
    const averageCommission = closedWonInPeriod.length
      ? closedWonInPeriod.reduce((sum, deal) => sum + deal.effectiveCommission, 0) / closedWonInPeriod.length
      : 0;

    const monthlySeriesByKey = dashboardClosedWonDeals.reduce<Record<string, number>>((acc, deal) => {
      const key = format(deal.effectiveDate, "yyyy-MM");
      acc[key] = (acc[key] ?? 0) + deal.effectiveCommission;
      return acc;
    }, {});

    const monthlyCommissionSeries = Array.from({ length: 6 }, (_, index) => {
      const date = startOfMonth(subMonths(now, 5 - index));
      const key = format(date, "yyyy-MM");
      return {
        month: formatMonthLabel(date),
        value: monthlySeriesByKey[key] ?? 0,
      };
    });

    const funnelOrder = [
      { status: "LEAD", label: "Lead" },
      { status: "IN_PROGRESS", label: "Atendimento" },
      { status: "PROPOSAL", label: "Proposta" },
      { status: "VISIT", label: "Visita" },
      { status: "CLOSED", label: "Fechado" },
      { status: "LOST", label: "Perdido" },
    ] as const;

    const clientStatusMap = new Map(clientStatusCounts.map((item) => [item.status, item._count.status]));

    const funnel = funnelOrder.map((item) => ({
      stage: item.label,
      value: clientStatusMap.get(item.status) ?? 0,
    }));

    const overdueCount = followUpClients.filter((client) => {
      const due = client.nextFollowUp ? new Date(client.nextFollowUp) : null;
      return due ? due < now && !isSameDay(due, now) : false;
    }).length;

    const followUpsBase = followUpClients.map((client) => {
      const due = client.nextFollowUp ? new Date(client.nextFollowUp) : null;
      const label = due
        ? isSameDay(due, now)
          ? `Hoje · ${format(due, "HH:mm")}`
          : `${format(due, "dd/MM")} · ${format(due, "HH:mm")}`
        : "Sem data";
      const status = due
        ? due < now && !isSameDay(due, now)
          ? "Atrasado"
          : isSameDay(due, now)
            ? "Hoje"
            : "Próximo"
        : "Sem data";

      return {
        name: client.name,
        when: label,
        status,
      };
    });

    const followUpsFiltered = normalizedSearch
      ? followUpsBase.filter((item) =>
          matchesSearch([item.name, item.when, item.status], normalizedSearch)
        )
      : followUpsBase;

    const followUps = followUpsFiltered.slice(0, 3);
    const followUpsTotalCount = followUpsFiltered.length;

    const topPropertiesBase = allProperties.map((property) => ({
      id: property.id,
      name: property.address,
      meta: `${propertyTypeLabel(property.type)} · ${toNumber(property.price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })}`,
      status: propertyStatusLabel(property.status),
      views: property.shareViews,
      searchText: [
        property.address,
        property.city,
        property.type,
        propertyStatusLabel(property.status),
        property.shareViews,
      ],
    }));

    const topPropertiesFiltered = normalizedSearch
      ? topPropertiesBase.filter((item) => matchesSearch(item.searchText, normalizedSearch))
      : topPropertiesBase;

    const topPropertiesSorted = [...topPropertiesFiltered].sort((a, b) => b.views - a.views);
    const topPropertiesTotalViews = topPropertiesSorted.reduce((sum, item) => sum + toNumber(item.views), 0);
    const topProperties = topPropertiesSorted.slice(0, 3).map(({ searchText, ...item }) => item);

    const totalCommission = closedWonInPeriod.reduce((sum, deal) => sum + deal.effectiveCommission, 0);
    const closedNegotiationsTotal = dashboardClosedWonDeals.length;

    const conversionData = [
      { name: "Fechadas", value: closedWonNegotiations },
      { name: "Perdidas", value: closedLostNegotiations },
    ];

    return {
      period,
      totalActiveClients: activeClients,
      totalAvailableProperties: availableProperties,
      openNegotiations,
      closedNegotiations: closedWonNegotiations,
      closedNegotiationsTotal,
      lostNegotiations: closedLostNegotiations,
      totalNegotiations,
      forecastCommission,
      generatedCommission,
      totalCommission,
      averageCommission,
      conversionRate,
      monthlyCommissionSeries,
      funnel,
      followUps,
      followUpsTotalCount,
      topProperties,
      topPropertiesTotalViews,
      conversionData,
      overdueFollowUps: overdueCount,
    };
  }

  async getCommissionReport(userId: string, period: CommissionPeriod) {
    const [metrics, deals] = await Promise.all([
      this.getDashboardMetrics(userId, period),
      this.listClosedDeals(userId, period),
    ]);

    return {
      ...metrics,
      deals,
    };
  }

  async findNegotiationForClose(userId: string, negotiationId: string) {
    return prisma.negotiation.findFirst({
      where: { id: negotiationId, userId },
      select: {
        id: true,
        status: true,
        propertyId: true,
        property: {
          select: {
            commission: true,
            status: true,
          },
        },
      },
    });
  }

  async closeNegotiationWithSnapshot(negotiationId: string, propertyId: string, commission: number) {
    return prisma.$transaction([
      prisma.negotiation.update({
        where: { id: negotiationId },
        data: {
          status: "CLOSED_WON",
          closedAt: new Date(),
          commission,
        },
      }),
      prisma.property.update({
        where: { id: propertyId },
        data: { status: "SOLD" },
      }),
    ]);
  }
}

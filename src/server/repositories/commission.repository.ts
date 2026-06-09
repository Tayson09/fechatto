import { prisma } from "@/lib/prisma";
import { endOfMonth, endOfQuarter, endOfYear, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
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
        closedAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        closedAt: true,
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

    return deals.map((deal) => ({
      id: deal.id,
      closedAt: deal.closedAt?.toISOString() ?? null,
      commission: toNumber(deal.commission),
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

  async getDashboardMetrics(userId: string, period: CommissionPeriod) {
    const { start, end } = getPeriodBounds(period);

    const [activeClients, availableProperties, openNegotiations, closedNegotiations, totalNegotiations, generatedDeals, forecastDeals] =
      await Promise.all([
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
          where: { userId, createdAt: { gte: start, lte: end } },
        }),
        prisma.negotiation.aggregate({
          where: { userId, status: "CLOSED_WON", closedAt: { gte: start, lte: end } },
          _sum: { commission: true },
          _avg: { commission: true },
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
      ]);

    const generatedCommission = toNumber(generatedDeals._sum.commission);
    const averageCommission = toNumber(generatedDeals._avg.commission);
    const forecastCommission = forecastDeals.reduce((sum, item) => sum + toNumber(item.property.commission), 0);
    const conversionRate = totalNegotiations > 0 ? (closedNegotiations / totalNegotiations) * 100 : 0;

    return {
      period,
      totalActiveClients: activeClients,
      totalAvailableProperties: availableProperties,
      openNegotiations,
      closedNegotiations,
      totalNegotiations,
      forecastCommission,
      generatedCommission,
      totalCommission: generatedCommission,
      averageCommission,
      conversionRate,
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

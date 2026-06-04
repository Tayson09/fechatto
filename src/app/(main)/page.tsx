import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withCache } from "@/lib/cache";

async function getMetrics(userId: string) {
  return withCache(`dashboard:${userId}`, async () => {
    const [totalClients, totalProperties, openNegotiations, monthCommission] =
      await Promise.all([
        prisma.client.count({ where: { userId, deletedAt: null } }),
        prisma.property.count({ where: { userId, status: "AVAILABLE", deletedAt: null } }),
        prisma.negotiation.count({ where: { userId, status: "IN_PROGRESS" } }),
        prisma.negotiation.aggregate({
          where: {
            userId,
            status: "CLOSED_WON",
            closedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
          _sum: { commission: true },
        }),
      ]);

    return {
      totalClients,
      totalProperties,
      openNegotiations,
      monthCommission: monthCommission._sum.commission || 0,
    };
  }, 60_000);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const metrics = await getMetrics(session.user.id);

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div>Clientes ativos: {metrics.totalClients}</div>
        <div>Imóveis disponíveis: {metrics.totalProperties}</div>
        <div>Negociações em andamento: {metrics.openNegotiations}</div>
        <div>Comissão prevista (mês): R$ {Number(metrics.monthCommission).toFixed(2)}</div>
      </div>
    </div>
  );
}
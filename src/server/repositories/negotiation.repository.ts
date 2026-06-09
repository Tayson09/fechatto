import { prisma } from "@/lib/prisma";
import type { Prisma, NegotiationStatus } from "@prisma/client";
import type { CreateNegotiationSchemaInput, UpdateNegotiationSchemaInput } from "../validators/negotiation.schema";

export class NegotiationRepository {
  async findClient(userId: string, clientId: string) {
    return prisma.client.findFirst({ where: { id: clientId, userId, deletedAt: null } });
  }

  async findProperty(userId: string, propertyId: string) {
    return prisma.property.findFirst({ where: { id: propertyId, userId, deletedAt: null } });
  }

  async findOne(id: string, userId: string) {
    return prisma.negotiation.findFirst({
      where: { id, userId },
      include: {
        client: { select: { id: true, name: true, status: true } },
        property: { select: { id: true, type: true, address: true, city: true, price: true, commission: true, status: true } },
        visits: { orderBy: { date: "desc" } },
      },
    });
  }

  async listByUser(
    userId: string,
    opts: {
      select?: Prisma.NegotiationSelect;
      skip?: number;
      take?: number;
      status?: NegotiationStatus;
    } = {}
  ) {
    const { select, skip = 0, take = 20, status } = opts;
    return prisma.negotiation.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      select: select || {
        id: true,
        status: true,
        commission: true,
        notes: true,
        closedAt: true,
        createdAt: true,
        client: { select: { id: true, name: true } },
        property: { select: { id: true, type: true, address: true, city: true } },
      },
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    });
  }

  async create(userId: string, data: CreateNegotiationSchemaInput, commissionSnapshot: number) {
    return prisma.negotiation.create({
      data: {
        userId,
        clientId: data.clientId,
        propertyId: data.propertyId,
        notes: data.notes ?? null,
        status: "IN_PROGRESS",
        commission: commissionSnapshot,
      },
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, type: true, address: true, city: true, commission: true } },
      },
    });
  }

  async update(id: string, data: UpdateNegotiationSchemaInput) {
    return prisma.negotiation.update({
      where: { id },
      data: { notes: data.notes ?? null }
    });
  }

  async close(id: string, status: "CLOSED_WON" | "CLOSED_LOST", commissionSnapshot: number) {
    if (status === 'CLOSED_WON') {
      return prisma.$transaction(async (tx) => {
        const negotiation = await tx.negotiation.update({
          where: { id },
          data: {
            status: "CLOSED_WON",
            closedAt: new Date(),
            commission: commissionSnapshot,
          },
        });

        await tx.property.update({
          where: { id: negotiation.propertyId },
          data: { status: "SOLD" }
        });
        return negotiation;
      });
    }
    return prisma.negotiation.update({
      where: { id },
      data: {
        status: "CLOSED_LOST",
        closedAt: new Date(),
        commission: commissionSnapshot,
      },
    });
  }

  async addVisit(negotiationId: string, date: Date, result?: string | null) {
    return prisma.visit.create({
      data: {
        negotiationId,
        date,
        result: result ?? null,
      },
    });
  }

  async listVisits(negotiationId: string) {
    return prisma.visit.findMany({
      where: { negotiationId },
      orderBy: { date: "desc" },
    });
  }
}

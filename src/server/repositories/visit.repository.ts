import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class VisitRepository {
  async listByUser(userId: string) {
    return prisma.visit.findMany({
      where: {
        negotiation: {
          userId,
        },
      },
      include: {
        negotiation: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            property: {
              select: {
                id: true,
                address: true,
                city: true,
                type: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async listNegotiationsByUser(userId: string) {
    return prisma.negotiation.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        client: {
          select: {
            name: true,
          },
        },
        property: {
          select: {
            address: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByIdForUser(userId: string, id: string) {
    return prisma.visit.findFirst({
      where: {
        id,
        negotiation: {
          userId,
        },
      },
      include: {
        negotiation: {
          include: {
            client: {
              select: { id: true, name: true },
            },
            property: {
              select: { id: true, address: true, city: true, type: true, status: true },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.VisitUncheckedCreateInput) {
    return prisma.visit.create({
      data,
      include: {
        negotiation: {
          include: {
            client: {
              select: { id: true, name: true },
            },
            property: {
              select: { id: true, address: true, city: true, type: true, status: true },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.VisitUncheckedUpdateInput) {
    return prisma.visit.update({
      where: { id },
      data,
      include: {
        negotiation: {
          include: {
            client: {
              select: { id: true, name: true },
            },
            property: {
              select: { id: true, address: true, city: true, type: true, status: true },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.visit.delete({
      where: { id },
    });
  }
}
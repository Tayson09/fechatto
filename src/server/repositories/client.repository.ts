import { prisma } from "@/lib/prisma";
import type { CreateClientInput, UpdateClientInput } from "../validators/client.schema";
import type { Prisma } from "@prisma/client";

export class ClientRepository {
  async create(userId: string, data: CreateClientInput) {
    return prisma.client.create({
      data: {
        ...data,
        userId,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      },
    });
  }

  async findOne(id: string, userId: string) {
    return prisma.client.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async findAllByUser(
    userId: string,
    opts: {
      select?: Prisma.ClientSelect;
      skip?: number;
      take?: number;
      status?: string;
    } = {}
  ) {
    const { select, skip = 0, take = 20, status } = opts;
    return prisma.client.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status: status as any } : {}),
      },
      select: select || {
        id: true,
        name: true,
        status: true,
        nextFollowUp: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOverdue(userId: string, now: Date) {
    return prisma.client.findMany({
      where: {
        userId,
        deletedAt: null,
        nextFollowUp: { lte: now },
        status: { notIn: ["CLOSED", "LOST"] },
      },
      select: { id: true, name: true, nextFollowUp: true, status: true },
      orderBy: { nextFollowUp: "asc" },
    });
  }

  async update(id: string, data: UpdateClientInput) {
    return prisma.client.update({
      where: { id },
      data: {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addHistoryNote(clientId: string, note: string) {
    return prisma.clientHistory.create({
      data: { clientId, note },
    });
  }
}
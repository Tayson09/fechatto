import { prisma } from "@/lib/prisma";
import type { CreateClientInput, UpdateClientInput } from "../validators/client.schema";
import type { CreateHistoryInput } from "../validators/history.schema";
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

  async findWithHistory(id: string, userId: string) {
    return prisma.client.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findAllByUser(
    userId: string,
    opts: {
      select?: Prisma.ClientSelect;
      skip?: number;
      take?: number;
      status?: string;
      search?: string;
    } = {}
  ) {
    const { select, skip = 0, take = 20, status, search } = opts;
    return prisma.client.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status: status as never } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
      select: select || {
        id: true,
        name: true,
        profile: true,
        status: true,
        location: true,
        nextFollowUp: true,
        nextFollowUpNote: true,
        updatedAt: true,
        createdAt: true,
      },
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    });
  }

  async count(userId: string, opts: { status?: string; search?: string } = {}) {
    const { status, search } = opts;
    return prisma.client.count({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status: status as never } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
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
      select: {
        id: true,
        name: true,
        profile: true,
        status: true,
        nextFollowUp: true,
        nextFollowUpNote: true,
      },
      orderBy: { nextFollowUp: "asc" },
    });
  }

  async findUpcoming(userId: string, from: Date, to: Date) {
    return prisma.client.findMany({
      where: {
        userId,
        deletedAt: null,
        nextFollowUp: { gt: from, lte: to },
        status: { notIn: ["CLOSED", "LOST"] },
      },
      select: {
        id: true,
        name: true,
        profile: true,
        status: true,
        nextFollowUp: true,
        nextFollowUpNote: true,
      },
      orderBy: { nextFollowUp: "asc" },
    });
  }

  async update(id: string, data: UpdateClientInput) {
    return prisma.client.update({
      where: { id },
      data: {
        ...data,
        nextFollowUp: data.nextFollowUp
          ? new Date(data.nextFollowUp)
          : data.nextFollowUp === null
          ? null
          : undefined,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findHistory(clientId: string) {
    return prisma.clientHistory.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addHistoryNote(clientId: string, data: CreateHistoryInput) {
    return prisma.clientHistory.create({
      data: { clientId, ...data },
    });
  }
}

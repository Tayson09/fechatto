import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import type { Prisma } from "@prisma/client";
import type { CreatePropertyInput, UpdatePropertyInput } from "../validators/property.schema";

export class PropertyRepository {
  async create(userId: string, data: CreatePropertyInput) {
    const { photos = [], shareEnabled, ...payload } = data;

    return prisma.property.create({
      data: {
        ...payload,
        userId,
        area: data.area ?? null,
        notes: data.notes ?? null,
        shareEnabled: shareEnabled ?? false,
        shareToken: shareEnabled ? nanoid(12) : null,
        photos: photos.length
          ? {
              create: photos.map((url: string, index: number) => ({ url, order: index })),
            }
          : undefined,
      },
      include: { photos: { orderBy: { order: "asc" } } },
    });
  }

  async findOne(id: string, userId: string) {
    return prisma.property.findFirst({
      where: { id, userId, deletedAt: null },
      include: { photos: { orderBy: { order: "asc" } } },
    });
  }

  async findByToken(token: string) {
    return prisma.property.findFirst({
      where: { shareToken: token, shareEnabled: true, deletedAt: null },
      include: {
        photos: { orderBy: { order: "asc" } },
        user: { select: { name: true, phone: true, email: true } },
      },
    });
  }

  async listByUser(
    userId: string,
    opts: {
      select?: Prisma.PropertySelect;
      skip?: number;
      take?: number;
      status?: string;
      type?: string;
      search?: string;
    } = {}
  ) {
    const { select, skip = 0, take = 20, status, type, search } = opts;
    return prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
        ...(search
          ? {
              OR: [
                { address: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select:
        select || {
          id: true,
          type: true,
          address: true,
          city: true,
          price: true,
          commission: true,
          status: true,
          shareEnabled: true,
          shareToken: true,
          shareViews: true,
          updatedAt: true,
          photos: {
            select: {
              id: true,
              url: true,
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    });
  }

  async update(id: string, data: UpdatePropertyInput) {
    const { photos, area, notes, ...rest } = data;

    return prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: { id },
        data: {
          ...rest,
          area: area ?? undefined,
          notes: notes ?? undefined,
          shareToken:
            rest.shareEnabled === true
              ? (rest.shareToken ?? nanoid(12))
              : rest.shareEnabled === false
                ? null
                : rest.shareToken,
        },
      });

      if (Array.isArray(photos)) {
        await tx.propertyPhoto.deleteMany({ where: { propertyId: id } });
        if (photos.length > 0) {
          await tx.propertyPhoto.createMany({
            data: photos.map((url: string, index: number) => ({ propertyId: id, url, order: index })),
          });
        }
      }

      return tx.property.findUnique({
        where: { id: property.id },
        include: { photos: { orderBy: { order: "asc" } } },
      });
    });
  }

  async softDelete(id: string) {
    return prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async enableShareLink(id: string) {
    return prisma.property.update({
      where: { id },
      data: {
        shareEnabled: true,
        shareToken: nanoid(12),
      },
    });
  }

  async revokeShareLink(id: string) {
    return prisma.property.update({
      where: { id },
      data: {
        shareEnabled: false,
        shareToken: null,
      },
    });
  }

  async incrementShareViewsByToken(token: string) {
    return prisma.property.updateMany({
      where: { shareToken: token, shareEnabled: true, deletedAt: null },
      data: { shareViews: { increment: 1 } },
    });
  }
}

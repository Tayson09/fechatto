import { prisma } from "@/lib/prisma";
import type { PropertyStatus, PropertyType } from "@prisma/client";
import type {
  AddPropertyPhotoSchemaInput,
  CreatePropertySchemaInput,
  ReorderPropertyPhotosSchemaInput,
  UpdatePropertySchemaInput,
} from "../validators/property.schema";

export class PropertyRepository {
  async findById(id: string, userId: string) {
    return prisma.property.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async findPublicByToken(token: string) {
    return prisma.property.findFirst({
      where: {
        shareToken: token,
        shareEnabled: true,
        deletedAt: null,
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  async listByUser(
    userId: string,
    opts: {
      skip?: number;
      take?: number;
      status?: PropertyStatus;
      type?: PropertyType;
      search?: string;
    } = {}
  ) {
    const { skip = 0, take = 20, status, type, search } = opts;

    return prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(search
          ? {
              OR: [
                { address: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { neighborhood: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        type: true,
        address: true,
        city: true,
        area: true,
        price: true,
        commission: true,
        status: true,
        shareToken: true,
        shareEnabled: true,
        shareViews: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          orderBy: { order: "asc" },
          take: 1,
          select: {
            id: true,
            url: true,
            order: true,
          },
        },
      },
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    });
  }

  async create(userId: string, data: CreatePropertySchemaInput) {
    return prisma.property.create({
      data: {
        userId,
        type: data.type,
        address: data.address,
        city: data.city,
        area: data.area ?? null,
        price: data.price,
        commission: data.commission,
        notes: data.notes ?? null,
        status: "AVAILABLE",
        shareEnabled: false,
        shareViews: 0,
      },
      include: {
        photos: true,
      },
    });
  }

  async update(id: string, data: UpdatePropertySchemaInput) {
    return prisma.property.update({
      where: { id },
      data: {
        ...(data.type ? { type: data.type } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.area !== undefined ? { area: data.area } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.commission !== undefined ? { commission: data.commission } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.neighborhood !== undefined ? { neighborhood: data.neighborhood } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async softDelete(id: string) {
    return prisma.property.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        shareEnabled: false,
      },
    });
  }

  async updateStatus(id: string, status: PropertyStatus) {
    return prisma.property.update({
      where: { id },
      data: { status },
    });
  }

  async setShareToken(id: string, token: string) {
    return prisma.property.update({
      where: { id },
      data: {
        shareToken: token,
        shareEnabled: true,
      },
    });
  }

  async setShareEnabled(id: string, enabled: boolean) {
    return prisma.property.update({
      where: { id },
      data: {
        shareEnabled: enabled,
      },
    });
  }

  async incrementShareViews(id: string) {
    return prisma.property.update({
      where: { id },
      data: {
        shareViews: {
          increment: 1,
        },
      },
    });
  }

  async addPhoto(propertyId: string, data: AddPropertyPhotoSchemaInput) {
    return prisma.propertyPhoto.create({
      data: {
        propertyId,
        url: data.url,
        order: data.order ?? 0,
      },
    });
  }

  async removePhoto(propertyId: string, photoId: string) {
    return prisma.propertyPhoto.deleteMany({
      where: {
        id: photoId,
        propertyId,
      },
    });
  }

  async reorderPhotos(propertyId: string, photos: ReorderPropertyPhotosSchemaInput["photos"]) {
    return prisma.$transaction(
      photos.map((photo) =>
        prisma.propertyPhoto.update({
          where: {
            id: photo.id,
            propertyId,
          },
          data: {
            order: photo.order,
          },
        })
      )
    );
  }

  async listPhotos(propertyId: string) {
    return prisma.propertyPhoto.findMany({
      where: { propertyId },
      orderBy: { order: "asc" },
    });
  }
}
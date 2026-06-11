import crypto from "crypto";
import { invalidateCache, withCache } from "@/lib/cache";
import { AppError, NotFoundError } from "@/lib/errors";
import { PropertyRepository } from "../repositories/property.repository";
import {
  AddPropertyPhotoSchema,
  CreatePropertySchema,
  ReorderPropertyPhotosSchema,
  ToggleShareSchema,
  UpdatePropertySchema,
  UpdatePropertyStatusSchema,
} from "../validators/property.schema";
import type {
  AddPropertyPhotoSchemaInput,
  CreatePropertySchemaInput,
  ReorderPropertyPhotosSchemaInput,
  UpdatePropertySchemaInput,
  UpdatePropertyStatusSchemaInput,
} from "../validators/property.schema";
import type { PropertyStatus, PropertyType } from "@prisma/client";

export class PropertyService {
  constructor(private repo: PropertyRepository) {}

  async list(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      status?: PropertyStatus;
      type?: PropertyType;
      search?: string;
    } = {}
  ) {
    return withCache(
      `properties:${userId}:${JSON.stringify(params)}`,
      () => this.repo.listByUser(userId, params),
      30_000
    );
  }

  async getById(userId: string, propertyId: string) {
    const property = await this.repo.findById(propertyId, userId);
    if (!property) throw new NotFoundError("Imóvel");
    return property;
  }

  async create(userId: string, data: unknown) {
    const validated = CreatePropertySchema.parse(data) as CreatePropertySchemaInput;
    const result = await this.repo.create(userId, validated);
    this.clearCache(userId);
    return result;
  }

  async update(userId: string, propertyId: string, data: unknown) {
    const validated = UpdatePropertySchema.parse(data) as UpdatePropertySchemaInput;
    await this.getById(userId, propertyId);
    const result = await this.repo.update(propertyId, validated);
    this.clearCache(userId);
    return result;
  }

  async remove(userId: string, propertyId: string) {
    await this.getById(userId, propertyId);
    const result = await this.repo.softDelete(propertyId);
    this.clearCache(userId);
    return result;
  }

  async updateStatus(userId: string, propertyId: string, data: unknown) {
    const validated = UpdatePropertyStatusSchema.parse(data) as UpdatePropertyStatusSchemaInput;
    await this.getById(userId, propertyId);
    const result = await this.repo.updateStatus(propertyId, validated.status);
    this.clearCache(userId);
    return result;
  }

  async generateShareLink(userId: string, propertyId: string) {
    await this.getById(userId, propertyId);
    const token = crypto.randomUUID();
    const result = await this.repo.setShareToken(propertyId, token);
    this.clearCache(userId);

    return {
      ...result,
      shareUrl: this.buildPublicUrl(token),
    };
  }

  async toggleShare(userId: string, propertyId: string, data: unknown) {
    const validated = ToggleShareSchema.parse(data);
    await this.getById(userId, propertyId);
    const result = await this.repo.setShareEnabled(propertyId, validated.enabled);
    this.clearCache(userId);
    return result;
  }

  async incrementPublicView(token: string) {
    const property = await this.repo.findPublicByToken(token);
    if (!property) throw new NotFoundError("Imóvel público");

    await this.repo.incrementShareViews(property.id);

    return property;
  }

  async getPublicByToken(token: string) {
    const property = await this.repo.findPublicByToken(token);
    if (!property) throw new NotFoundError("Imóvel");

    return property;
  }

  async addPhoto(userId: string, propertyId: string, data: unknown) {
    const validated = AddPropertyPhotoSchema.parse(data) as AddPropertyPhotoSchemaInput;
    await this.getById(userId, propertyId);
    const result = await this.repo.addPhoto(propertyId, validated);
    this.clearCache(userId);
    return result;
  }

  async removePhoto(userId: string, propertyId: string, photoId: string) {
    await this.getById(userId, propertyId);
    const result = await this.repo.removePhoto(propertyId, photoId);
    this.clearCache(userId);
    return result;
  }

  async reorderPhotos(userId: string, propertyId: string, data: unknown) {
    const validated = ReorderPropertyPhotosSchema.parse(data) as ReorderPropertyPhotosSchemaInput;
    await this.getById(userId, propertyId);
    const result = await this.repo.reorderPhotos(propertyId, validated.photos);
    this.clearCache(userId);
    return result;
  }

  private buildPublicUrl(token: string) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    return `${baseUrl.replace(/\/$/, "")}/imovel/${token}`;
  }

  private clearCache(userId: string) {
    invalidateCache(`properties:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    invalidateCache(`negotiations:${userId}:`);
  }
}
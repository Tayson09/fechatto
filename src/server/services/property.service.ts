import { NotFoundError } from "@/lib/errors";
import { invalidateCache, withCache } from "@/lib/cache";
import { PropertyRepository } from "../repositories/property.repository";
import { CreatePropertySchema, UpdatePropertySchema } from "../validators/property.schema";
import type { CreatePropertyInput, UpdatePropertyInput } from "../validators/property.schema";

export class PropertyService {
  constructor(private repo: PropertyRepository) {}

  async create(userId: string, data: unknown) {
    const validated = CreatePropertySchema.parse(data) as CreatePropertyInput;
    const result = await this.repo.create(userId, validated);
    invalidateCache(`properties:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async list(userId: string, params: { skip?: number; take?: number; status?: string; type?: string; search?: string }) {
    return withCache(`properties:${userId}:${JSON.stringify(params)}`, () => this.repo.listByUser(userId, params), 30_000);
  }

  async getById(userId: string, propertyId: string) {
    const property = await this.repo.findOne(propertyId, userId);
    if (!property) throw new NotFoundError("Imóvel");
    return property;
  }

  async update(userId: string, propertyId: string, data: unknown) {
    const validated = UpdatePropertySchema.parse(data) as UpdatePropertyInput;
    await this.getById(userId, propertyId);
    const result = await this.repo.update(propertyId, validated);
    invalidateCache(`properties:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async softDelete(userId: string, propertyId: string) {
    await this.getById(userId, propertyId);
    const result = await this.repo.softDelete(propertyId);
    invalidateCache(`properties:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async enableShareLink(userId: string, propertyId: string) {
    await this.getById(userId, propertyId);
    const result = await this.repo.enableShareLink(propertyId);
    invalidateCache(`properties:${userId}:`);
    return result;
  }

  async revokeShareLink(userId: string, propertyId: string) {
    await this.getById(userId, propertyId);
    const result = await this.repo.revokeShareLink(propertyId);
    invalidateCache(`properties:${userId}:`);
    return result;
  }

  async findPublicByToken(token: string) {
    return this.repo.findByToken(token);
  }

  async incrementShareViews(token: string) {
    return this.repo.incrementShareViewsByToken(token);
  }
}

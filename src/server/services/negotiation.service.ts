import { invalidateCache, withCache } from "@/lib/cache";
import { NotFoundError } from "@/lib/errors";
import { NegotiationRepository } from "../repositories/negotiation.repository";
import { CloseNegotiationSchema, CreateNegotiationSchema, UpdateNegotiationSchema } from "../validators/negotiation.schema";
import type { CreateNegotiationInput, UpdateNegotiationInput } from "../validators/negotiation.schema";

export class NegotiationService {
  constructor(private repo: NegotiationRepository) {}

  async create(userId: string, data: unknown) {
    const validated = CreateNegotiationSchema.parse(data) as CreateNegotiationInput;
    const client = await this.repo.findClient(userId, validated.clientId);
    if (!client) throw new NotFoundError("Cliente");

    const property = await this.repo.findProperty(userId, validated.propertyId);
    if (!property) throw new NotFoundError("Imóvel");

    const result = await this.repo.create(userId, validated, Number(property.commission ?? 0));
    invalidateCache(`negotiations:${userId}:`);
    invalidateCache(`commissions:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async list(userId: string, params: { skip?: number; take?: number; status?: string }) {
    return withCache(`negotiations:${userId}:${JSON.stringify(params)}`, () => this.repo.listByUser(userId, params), 30_000);
  }

  async getById(userId: string, negotiationId: string) {
    const negotiation = await this.repo.findOne(negotiationId, userId);
    if (!negotiation) throw new NotFoundError("Negociação");
    return negotiation;
  }

  async ensureOwner(userId: string, negotiationId: string) {
    const negotiation = await this.repo.findBasicById(negotiationId, userId);
    if (!negotiation) throw new NotFoundError("Negociação");
    return negotiation;
  }

  async update(userId: string, negotiationId: string, data: unknown) {
    const validated = UpdateNegotiationSchema.parse(data) as UpdateNegotiationInput;
    await this.getById(userId, negotiationId);
    const result = await this.repo.update(negotiationId, validated);
    invalidateCache(`negotiations:${userId}:`);
    invalidateCache(`commissions:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async close(userId: string, negotiationId: string, data: unknown) {
    CloseNegotiationSchema.parse(data);
    const negotiation = await this.getById(userId, negotiationId);
    const property = await this.repo.findProperty(userId, negotiation.propertyId);
    if (!property) throw new NotFoundError("Imóvel");

    const result = await this.repo.close(negotiationId, Number(property.commission ?? 0));
    invalidateCache(`negotiations:${userId}:`);
    invalidateCache(`commissions:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async markLost(userId: string, negotiationId: string) {
    await this.getById(userId, negotiationId);
    const result = await this.repo.markLost(negotiationId);
    invalidateCache(`negotiations:${userId}:`);
    invalidateCache(`commissions:${userId}:`);
    invalidateCache(`dashboard:${userId}:`);
    return result;
  }

  async addVisit(userId: string, negotiationId: string, date: Date, result?: string | null) {
    await this.ensureOwner(userId, negotiationId);
    return this.repo.addVisit(negotiationId, date, result);
  }

  async listVisits(userId: string) {
    return this.repo.listVisits(userId);
  }

  async listVisitsByNegotiation(userId: string, negotiationId: string) {
    await this.ensureOwner(userId, negotiationId);
    return this.repo.listVisitsByNegotiation(userId, negotiationId);
  }
}

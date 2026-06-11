// src/server/services/visit.service.ts
import { NotFoundError } from "@/lib/errors";
import { VisitRepository } from "@/server/repositories/visit.repository";
import type { CreateVisitInput, UpdateVisitInput } from "@/server/validators/visit.schema";

export class VisitService {
  constructor(private readonly visitRepository: VisitRepository) {}

  async listVisits(userId: string) {
    return this.visitRepository.listByUser(userId);
  }

  async listNegotiationsForVisit(userId: string) {
    return this.visitRepository.listNegotiationsByUser(userId);
  }

  async createVisit(userId: string, input: CreateVisitInput) {
    const negotiation = await this.visitRepository.listNegotiationsByUser(userId);
    const exists = negotiation.some((n) => n.id === input.negotiationId);

    if (!exists) {
      throw new NotFoundError("Negociação não encontrada");
    }

    return this.visitRepository.create({
      negotiationId: input.negotiationId,
      date: input.date,
      result: input.result?.trim() || null,
    });
  }

  async updateVisit(userId: string, input: UpdateVisitInput) {
    const visit = await this.visitRepository.findByIdForUser(userId, input.id);

    if (!visit) {
      throw new NotFoundError("Visita não encontrada");
    }

    if (input.negotiationId && input.negotiationId !== visit.negotiationId) {
      const negotiations = await this.visitRepository.listNegotiationsByUser(userId);
      const exists = negotiations.some((n) => n.id === input.negotiationId);

      if (!exists) {
        throw new NotFoundError("Negociação não encontrada");
      }
    }

    return this.visitRepository.update(input.id, {
      negotiationId: input.negotiationId,
      date: input.date,
      result: input.result?.trim() ?? undefined,
    });
  }

  async deleteVisit(userId: string, id: string) {
    const visit = await this.visitRepository.findByIdForUser(userId, id);

    if (!visit) {
      throw new NotFoundError("Visita não encontrada");
    }

    return this.visitRepository.delete(id);
  }
}
import { invalidateCache, withCache } from "@/lib/cache";
import { NotFoundError } from "@/lib/errors";
import type { CommissionPeriod } from "../validators/commission.schema";
import { CommissionRepository } from "../repositories/commission.repository";

export class CommissionService {
  constructor(private repo: CommissionRepository) {}

  async getDashboardMetrics(userId: string, period: CommissionPeriod, search = "") {
    const normalizedSearch = search.trim().toLowerCase();
    return withCache(`dashboard:${userId}:${period}:${normalizedSearch}`, async () => {
      return this.repo.getDashboardMetrics(userId, period, search);
    }, 60_000);
  }

  async getCommissionReport(userId: string, period: CommissionPeriod) {
    return withCache(`commissions:${userId}:${period}`, async () => {
      return this.repo.getCommissionReport(userId, period);
    }, 60_000);
  }

  async closeNegotiationWithSnapshot(userId: string, negotiationId: string) {
    const negotiation = await this.repo.findNegotiationForClose(userId, negotiationId);
    if (!negotiation) throw new NotFoundError("Negociação");

    const commissionValue = Number(negotiation.property.commission ?? 0);

    const result = await this.repo.closeNegotiationWithSnapshot(
      negotiationId,
      negotiation.propertyId,
      commissionValue
    );

    invalidateCache(`dashboard:${userId}:`);
    invalidateCache(`commissions:${userId}:`);

    return result;
  }
}

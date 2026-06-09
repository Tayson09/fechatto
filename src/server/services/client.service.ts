import { ClientRepository } from "../repositories/client.repository";
import { CreateClientSchema, UpdateClientSchema } from "../validators/client.schema";
import { CreateHistorySchema } from "../validators/history.schema";
import { NotFoundError } from "@/lib/errors";
import type { CreateClientInput, UpdateClientInput } from "../validators/client.schema";
import type { CreateHistoryInput } from "../validators/history.schema";
import { addDays } from "date-fns";

export class ClientService {
  constructor(private repo: ClientRepository) {}

  async create(userId: string, data: unknown) {
    const validated = CreateClientSchema.parse(data) as CreateClientInput;
    return this.repo.create(userId, validated);
  }

  async update(userId: string, clientId: string, data: unknown) {
    const validated = UpdateClientSchema.parse(data) as UpdateClientInput;
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return this.repo.update(clientId, validated);
  }

  async softDelete(userId: string, clientId: string) {
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return this.repo.softDelete(clientId);
  }

  async getById(userId: string, clientId: string) {
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return client;
  }

  async getWithHistory(userId: string, clientId: string) {
    const client = await this.repo.findWithHistory(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return client;
  }

  async getKanban(userId: string) {
    const clients = await this.repo.findAllByUser(userId, {
      select: {
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
      take: 200,
    });
    const columns: Record<string, typeof clients> = {};
    (clients as Array<Record<string, unknown> & { status: string }>).forEach((c) => {
      const col = columns[c.status] || [];
      col.push(c as (typeof clients)[number]);
      columns[c.status] = col;
    });
    return columns;
  }

  async list(
    userId: string,
    params: { skip?: number; take?: number; status?: string; search?: string }
  ) {
    const [clients, total] = await Promise.all([
      this.repo.findAllByUser(userId, params),
      this.repo.count(userId, { status: params.status, search: params.search }),
    ]);
    return { clients, total };
  }

  async getFollowUps(userId: string) {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const [overdue, upcoming] = await Promise.all([
      this.repo.findOverdue(userId, now),
      this.repo.findUpcoming(userId, now, nextWeek),
    ]);
    return { overdue, upcoming };
  }

  async getHistory(userId: string, clientId: string) {
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return this.repo.findHistory(clientId);
  }

  async addHistory(userId: string, clientId: string, data: unknown) {
    const validated = CreateHistorySchema.parse(data) as CreateHistoryInput;
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return this.repo.addHistoryNote(clientId, validated);
  }
}

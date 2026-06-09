import { ClientRepository } from "../repositories/client.repository";
import { CreateClientSchema, UpdateClientSchema } from "../validators/client.schema";
import { NotFoundError } from "@/lib/errors";
import type { CreateClientInput, UpdateClientInput } from "../validators/client.schema";

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

  async getKanban(userId: string) {
    const clients = await this.repo.findAllByUser(userId, {
      select: { id: true, name: true, status: true, nextFollowUp: true, updatedAt: true },
      take: 100, // limite para o kanban
    });
    // Agrupa por status
    const columns: Record<string, (typeof clients)[number][]> = {};
    clients.forEach((c: (typeof clients)[number]) => {
      const col = columns[c.status] || [];
      col.push(c);
      columns[c.status] = col;
    });
    return columns;
  }

  async list(userId: string, params: { skip?: number; take?: number; status?: string }) {
    return this.repo.findAllByUser(userId, params);
  }

  async getById(userId: string, clientId: string) {
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return client;
  }

  async getOverdueFollowUps(userId: string) {
    return this.repo.findOverdue(userId, new Date());
  }

  async addHistory(userId: string, clientId: string, note: string) {
    const client = await this.repo.findOne(clientId, userId);
    if (!client) throw new NotFoundError("Cliente");
    return this.repo.addHistoryNote(clientId, note);
  }
}
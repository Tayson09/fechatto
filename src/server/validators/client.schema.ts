import { z } from "zod";

const PropertyTypeSchema = z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"]);
export const ClientStatusSchema = z.enum(["LEAD", "IN_PROGRESS", "PROPOSAL", "VISIT", "CLOSED", "LOST"]);

const CLIENT_STATUS_ALIASES: Record<string, z.infer<typeof ClientStatusSchema>> = {
  LEAD: "LEAD",
  LEADS: "LEAD",
  PROSPECT: "LEAD",
  "EM_ATENDIMENTO": "IN_PROGRESS",
  ATENDIMENTO: "IN_PROGRESS",
  "IN_PROGRESS": "IN_PROGRESS",
  INPROGRESS: "IN_PROGRESS",
  "IN PROGRESS": "IN_PROGRESS",
  "EM PROGRESSO": "IN_PROGRESS",
  PROPOSAL: "PROPOSAL",
  PROPOSTA: "PROPOSAL",
  VISIT: "VISIT",
  VISITA: "VISIT",
  CLOSED: "CLOSED",
  FECHADO: "CLOSED",
  LOST: "LOST",
  PERDIDO: "LOST",
};

function normalizeClientStatus(value: unknown) {
  if (typeof value !== "string") return value;

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  return CLIENT_STATUS_ALIASES[normalized] ?? CLIENT_STATUS_ALIASES[value.trim().toUpperCase()] ?? value;
}

const ClientStatusInputSchema = z.preprocess(normalizeClientStatus, ClientStatusSchema);

export const CreateClientSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  age: z.number().int().positive().optional().nullable(),
  profession: z.string().optional().nullable(),
  income: z.number().positive().optional().nullable(),
  propertyType: z.array(PropertyTypeSchema).optional().default([]),
  location: z.string().optional().nullable(),
  priceMin: z.number().positive().optional().nullable(),
  priceMax: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
});

const UpdateClientBaseSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
  age: z.number().int().positive().optional().nullable(),
  profession: z.string().optional().nullable(),
  income: z.number().positive().optional().nullable(),
  propertyType: z.array(PropertyTypeSchema).optional(),
  location: z.string().optional().nullable(),
  priceMin: z.number().positive().optional().nullable(),
  priceMax: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
});

export const UpdateClientSchema = UpdateClientBaseSchema.extend({
  status: ClientStatusInputSchema.optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientStatus = z.infer<typeof ClientStatusSchema>;

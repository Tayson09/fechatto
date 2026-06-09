import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  profile: z.string().optional().nullable(),
  age: z.number().int().positive().optional().nullable(),
  profession: z.string().optional().nullable(),
  income: z.number().positive().optional().nullable(),
  propertyType: z
    .array(z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"]))
    .optional()
    .default([]),
  location: z.string().optional().nullable(),
  priceMin: z.number().positive().optional().nullable(),
  priceMax: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
  nextFollowUpNote: z.string().optional().nullable(),
});

export const UpdateClientSchema = CreateClientSchema.partial().extend({
  status: z
    .enum(["LEAD", "IN_PROGRESS", "PROPOSAL", "VISIT", "CLOSED", "LOST"])
    .optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

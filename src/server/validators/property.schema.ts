import { z } from "zod";

export const PropertyTypeSchema = z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"]);
export const PropertyStatusSchema = z.enum(["AVAILABLE", "RESERVED", "SOLD"]);

export const CreatePropertySchema = z.object({
  type: PropertyTypeSchema,
  address: z.string().min(3, "Endereço deve ter no mínimo 3 caracteres"),
  city: z.string().min(2, "Cidade deve ter no mínimo 2 caracteres"),
  area: z.number().positive().optional().nullable(),
  price: z.number().positive("Informe um valor maior que zero"),
  commission: z.number().nonnegative("A comissão não pode ser negativa"),
  notes: z.string().optional().nullable(),
  status: PropertyStatusSchema.optional(),
  photos: z.array(z.string().url("URL de foto inválida")).optional().default([]),
  shareEnabled: z.boolean().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial().extend({
  status: PropertyStatusSchema.optional(),
  shareToken: z.string().optional().nullable(),
  shareViews: z.number().int().nonnegative().optional(),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;

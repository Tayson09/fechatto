// src/server/validators/visit.schema.ts
import { z } from "zod";

export const createVisitSchema = z.object({
  negotiationId: z.string().cuid("Negociação inválida"),
  date: z.coerce.date({
    error: "Informe uma data válida",
  }),
  result: z
    .string()
    .trim()
    .max(2000, "O resultado pode ter no máximo 2000 caracteres")
    .optional()
    .nullable(),
});

export const updateVisitSchema = createVisitSchema
  .partial()
  .extend({
    id: z.string().cuid("ID inválido"),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "Informe ao menos um campo para atualização",
  });

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
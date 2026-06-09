import { z } from "zod";

export const CreateHistorySchema = z.object({
  type: z.enum(["CALL", "VISIT", "RETURN", "NOTE"]).default("NOTE"),
  title: z.string().max(120).optional().nullable(),
  note: z.string().min(1, "Anotação é obrigatória").max(2000),
});

export type CreateHistoryInput = z.infer<typeof CreateHistorySchema>;

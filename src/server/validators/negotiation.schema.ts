import { z } from "zod";

export const NegotiationStatusSchema = z.enum(["IN_PROGRESS", "CLOSED_WON", "CLOSED_LOST"]);

export const CreateNegotiationSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  propertyId: z.string().min(1, "Selecione um imóvel"),
  notes: z.string().optional().nullable(),
  status: NegotiationStatusSchema.optional(),
});

export const UpdateNegotiationSchema = CreateNegotiationSchema.partial().extend({
  status: NegotiationStatusSchema.optional(),
  closedAt: z.string().datetime().optional().nullable(),
});

export const CloseNegotiationSchema = z.object({
  closedAt: z.string().datetime().optional(),
});

export type CreateNegotiationInput = z.infer<typeof CreateNegotiationSchema>;
export type UpdateNegotiationInput = z.infer<typeof UpdateNegotiationSchema>;
export type CloseNegotiationInput = z.infer<typeof CloseNegotiationSchema>;
export type NegotiationStatus = z.infer<typeof NegotiationStatusSchema>;

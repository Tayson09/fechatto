import { z } from 'zod';

export const NegotiationStatusSchema = z.enum([
  "IN_PROGRESS",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

export const CreateNegotiationSchema = z.object({
  clientId: z.string().cuid("Selecione um cliente!"),
  propertyId: z.string().cuid("Selecione um imóvel!"),
  notes: z.string().max(1000).optional().nullable(),
});

export const UpdateNegotiationSchema = z.object({
  notes: z.string().max(1000).optional().nullable(),
});

export const CloseNegotiationSchema = z.object({
  status: z.enum(["CLOSED_WON", "CLOSED_LOST"], 
    { error: "Status deve ser CLOSED_WON ou CLOSED_LOST", }
  ),
  notes: z.string().max(1000).optional().nullable(),
});

export const CreateVisitSchema = z.object({
  date: z.coerce.date({ error: "Data de visita inválida" }),
  result: z.string().max(2000, "O feedback deve ter no máximo 2000 caracters").optional().nullable(),
});

export type CreateNegotiationSchema = z.infer< typeof CreateNegotiationSchema >;
export type UpdateNegotiationSchema = z.infer< typeof UpdateNegotiationSchema >;
export type CloseNegotiationSchema = z.infer< typeof CloseNegotiationSchema >;
export type CreateVisitSchema = z.infer< typeof CreateVisitSchema >;
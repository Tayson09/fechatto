import { z } from "zod";

export const PropertyTypeSchema = z.enum([
  "HOUSE",
  "APARTMENT",
  "LAND",
  "COMMERCIAL",
]);

export const PropertyStatusSchema = z.enum([
  "AVAILABLE",
  "RESERVED",
  "SOLD",
]);

const optionalText = z.string().max(5000).optional().nullable();

export const CreatePropertySchema = z.object({
  type: PropertyTypeSchema,
  address: z.string().min(3, "Informe o endereço"),
  city: z.string().min(2, "Informe a cidade"),
  area: z.coerce.number().positive("Área deve ser maior que zero").optional().nullable(),
  price: z.coerce.number().positive("Informe um valor válido"),
  commission: z.coerce.number().min(0, "A comissão não pode ser negativa"),
  notes: optionalText,
  neighborhood: z.string().max(120).optional().nullable(),
  state: z.string().length(2, "Use a sigla do estado").optional().nullable(),
});

export const UpdatePropertySchema = z.object({
  type: PropertyTypeSchema.optional(),
  address: z.string().min(3, "Informe o endereço").optional(),
  city: z.string().min(2, "Informe a cidade").optional(),
  area: z.coerce.number().positive("Área deve ser maior que zero").optional().nullable(),
  price: z.coerce.number().positive("Informe um valor válido").optional(),
  commission: z.coerce.number().min(0, "A comissão não pode ser negativa").optional(),
  notes: optionalText,
  neighborhood: z.string().max(120).optional().nullable(),
  state: z.string().length(2, "Use a sigla do estado").optional().nullable(),
});

export const UpdatePropertyStatusSchema = z.object({
  status: PropertyStatusSchema,
});

export const ToggleShareSchema = z.object({
  enabled: z.boolean(),
});

export const AddPropertyPhotoSchema = z.object({
  url: z.string().url("URL da foto inválida"),
  order: z.coerce.number().int().min(0).optional(),
});

export const ReorderPropertyPhotosSchema = z.object({
  photos: z.array(
    z.object({
      id: z.string().cuid("ID da foto inválido"),
      order: z.coerce.number().int().min(0),
    })
  ).min(1, "Envie ao menos uma foto"),
});

export type CreatePropertySchemaInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertySchemaInput = z.infer<typeof UpdatePropertySchema>;
export type UpdatePropertyStatusSchemaInput = z.infer<typeof UpdatePropertyStatusSchema>;
export type ToggleShareSchemaInput = z.infer<typeof ToggleShareSchema>;
export type AddPropertyPhotoSchemaInput = z.infer<typeof AddPropertyPhotoSchema>;
export type ReorderPropertyPhotosSchemaInput = z.infer<typeof ReorderPropertyPhotosSchema>;
import type { PropertyType, PropertyStatus } from "@prisma/client";

export type PropertyDetail = {
  id: string;
  userId: string;
  type: PropertyType;
  address: string;
  city: string;
  area: number | null;
  price: number;
  commission: number;
  notes: string | null;
  status: PropertyStatus;
  shareToken: string | null;
  shareEnabled: boolean;
  shareViews: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
  photos: PropertyPhoto[];
};

export type PropertyPhoto = {
  id: string;
  propertyId: string;
  url: string;
  order: number;
  createdAt: string | Date;
};

export type CreatePropertyInput = {
  type: PropertyType;
  address: string;
  city: string;
  area?: number | null;
  price: number;
  commission: number;
  notes?: string | null;
  status?: PropertyStatus;
  photos?: string[];
  shareEnabled?: boolean;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export type PropertyFilters = {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  type?: PropertyType;
  search?: string;
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  HOUSE: "bg-amber-100 text-amber-800",
  APARTMENT: "bg-blue-100 text-blue-800",
  LAND: "bg-green-100 text-green-800",
  COMMERCIAL: "bg-purple-100 text-purple-800",
};

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  RESERVED: "bg-yellow-100 text-yellow-800",
  SOLD: "bg-red-100 text-red-800",
};
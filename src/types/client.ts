export type ClientStatus = "LEAD" | "IN_PROGRESS" | "PROPOSAL" | "VISIT" | "CLOSED" | "LOST";
export type PropertyType = "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";
export type InteractionType = "CALL" | "VISIT" | "RETURN" | "NOTE";

export interface ClientCard {
  id: string;
  name: string;
  profile?: string | null;
  status: ClientStatus;
  location?: string | null;
  nextFollowUp?: string | null;
  nextFollowUpNote?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface ClientDetail extends ClientCard {
  age?: number | null;
  profession?: string | null;
  income?: number | string | null;
  propertyType: PropertyType[];
  priceMin?: number | string | null;
  priceMax?: number | string | null;
  notes?: string | null;
}

export interface HistoryEntry {
  id: string;
  clientId: string;
  type: InteractionType;
  title?: string | null;
  note: string;
  createdAt: string;
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "Em Atendimento",
  PROPOSAL: "Proposta",
  VISIT: "Visita",
  CLOSED: "Fechado",
  LOST: "Perdido",
};

export const STATUS_ORDER: ClientStatus[] = [
  "LEAD",
  "IN_PROGRESS",
  "PROPOSAL",
  "VISIT",
  "CLOSED",
  "LOST",
];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  CALL: "Ligação",
  VISIT: "Visita",
  RETURN: "Retorno",
  NOTE: "Anotação",
};

export const STATUS_STYLES: Record<
  ClientStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  LEAD: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  PROPOSAL: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  VISIT: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  CLOSED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  LOST: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

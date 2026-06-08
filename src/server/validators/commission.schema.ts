import { z } from "zod";

export const CommissionPeriodSchema = z.enum(["monthly", "quarterly", "yearly"]);
export type CommissionPeriod = z.infer<typeof CommissionPeriodSchema>;

export const CommissionQuerySchema = z.object({
  period: CommissionPeriodSchema.default("monthly"),
});

export function getPeriodLabel(period: CommissionPeriod) {
  switch (period) {
    case "quarterly":
      return "Trimestral";
    case "yearly":
      return "Anual";
    default:
      return "Mensal";
  }
}

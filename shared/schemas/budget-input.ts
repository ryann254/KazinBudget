import { z } from "zod";

export const BudgetInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(200, "Company must be at most 200 characters"),
  workLocation: z
    .string()
    .trim()
    .min(1, "Work location is required"),
  homeArea: z
    .string()
    .trim()
    .min(1, "Home area is required"),
  grossSalary: z
    .number()
    .positive("Gross salary must be greater than 0")
    .max(100_000_000, "Gross salary must be at most 100,000,000"),
  experienceYears: z
    .number()
    .int("Experience years must be a whole number")
    .min(0, "Experience years cannot be negative")
    .max(50, "Experience years must be at most 50"),
});

export type BudgetInputData = z.infer<typeof BudgetInputSchema>;

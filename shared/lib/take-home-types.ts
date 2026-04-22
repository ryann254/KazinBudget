import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

export const TakeHomeInputSchema = z.object({
  submissionId: z.string(),
  name: z.string(),
  companyName: z.string(),
  companyLocation: z.string(),
  companyLat: z.number().optional(),
  companyLng: z.number().optional(),
  residentialArea: z.string(),
  yearsOfExperience: z.number().int().min(0),
  monthlyGrossSalary: z.number().positive(),
  bedroomPreference: z
    .enum(["bedsitter", "1br", "2br"])
    .default("1br"),
  transportMode: z
    .enum(["matatu", "boda", "uber", "car", "brt"])
    .default("matatu"),
});

export type TakeHomeInput = z.infer<typeof TakeHomeInputSchema>;

// ---------------------------------------------------------------------------
// Expense item schema
// ---------------------------------------------------------------------------

export const ExpenseItemSchema = z.object({
  category: z.enum(["tax", "rent", "food", "transport", "custom"]),
  label: z.string(),
  amountKES: z.number().min(0),
  source: z.enum(["live", "cached", "fallback", "manual", "unavailable"]),
  confidence: z.enum(["high", "medium", "low"]),
  isEditable: z.boolean(),
});

export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;

// ---------------------------------------------------------------------------
// Tax summary schema
// ---------------------------------------------------------------------------

export const TaxSummarySchema = z.object({
  paye: z.number(),
  nssfTotal: z.number(),
  shif: z.number(),
  housingLevy: z.number(),
  totalTax: z.number(),
  taxableIncome: z.number(),
  personalRelief: z.number(),
});

export type TaxSummary = z.infer<typeof TaxSummarySchema>;

// ---------------------------------------------------------------------------
// Take-home result schema
// ---------------------------------------------------------------------------

export const TakeHomeResultSchema = z.object({
  submissionId: z.string(),
  grossSalary: z.number(),
  taxBreakdown: TaxSummarySchema,
  expenses: z.array(ExpenseItemSchema),
  totalTax: z.number(),
  totalLivingCosts: z.number(),
  totalCustomExpenses: z.number(),
  totalDeductions: z.number(),
  takeHomeSalary: z.number(),
  calculatedAt: z.number(),
  expiresAt: z.number(),
});

export type TakeHomeResult = z.infer<typeof TakeHomeResultSchema>;

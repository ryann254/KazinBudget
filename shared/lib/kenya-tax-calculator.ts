import { z } from "zod";
import {
  NSSF_RATE,
  NSSF_LEL,
  NSSF_UEL,
  SHIF_RATE,
  SHIF_MINIMUM,
  HOUSING_LEVY_RATE,
  PAYE_BRACKETS,
  PERSONAL_RELIEF,
} from "./kenya-tax-constants.js";

// ---------------------------------------------------------------------------
// Zod schemas & derived types
// ---------------------------------------------------------------------------

export const GrossSalarySchema = z.number().nonnegative();

export const TaxBreakdownSchema = z.object({
  grossSalary: z.number(),
  nssfTierI: z.number(),
  nssfTierII: z.number(),
  nssfTotal: z.number(),
  shif: z.number(),
  housingLevy: z.number(),
  taxableIncome: z.number(),
  grossTax: z.number(),
  personalRelief: z.number(),
  paye: z.number(),
  totalDeductions: z.number(),
  netSalary: z.number(),
});

export type TaxBreakdown = z.infer<typeof TaxBreakdownSchema>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function calculateNssf(grossSalary: number) {
  const tierI =
    Math.round(Math.min(grossSalary, NSSF_LEL) * NSSF_RATE * 100) / 100;
  const tierII =
    Math.round(
      Math.max(0, Math.min(grossSalary, NSSF_UEL) - NSSF_LEL) *
        NSSF_RATE *
        100,
    ) / 100;
  return { tierI, tierII, total: tierI + tierII };
}

function calculateShif(grossSalary: number): number {
  if (grossSalary === 0) return 0;
  return Math.max(
    SHIF_MINIMUM,
    Math.round(grossSalary * SHIF_RATE * 100) / 100,
  );
}

function calculateHousingLevy(grossSalary: number): number {
  return Math.round(grossSalary * HOUSING_LEVY_RATE * 100) / 100;
}

function calculatePaye(taxableIncome: number) {
  if (taxableIncome <= 0) {
    return { grossTax: 0, personalRelief: PERSONAL_RELIEF, paye: 0 };
  }

  let grossTax = 0;

  for (const bracket of PAYE_BRACKETS) {
    if (taxableIncome >= bracket.min) {
      const taxableInBand = Math.max(
        0,
        Math.min(taxableIncome, bracket.max) - bracket.min + 1,
      );
      grossTax += taxableInBand * bracket.rate;
    }
  }

  grossTax = Math.round(grossTax * 100) / 100;
  const paye = Math.round(Math.max(0, grossTax - PERSONAL_RELIEF) * 100) / 100;

  return { grossTax, personalRelief: PERSONAL_RELIEF, paye };
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export function calculateKenyanDeductions(
  grossMonthlySalary: number,
): TaxBreakdown {
  GrossSalarySchema.parse(grossMonthlySalary);

  const nssf = calculateNssf(grossMonthlySalary);
  const shif = calculateShif(grossMonthlySalary);
  const housingLevy = calculateHousingLevy(grossMonthlySalary);

  const taxableIncome = Math.max(
    0,
    grossMonthlySalary - nssf.total - shif - housingLevy,
  );

  const payeResult = calculatePaye(taxableIncome);

  const totalDeductions =
    payeResult.paye + nssf.total + shif + housingLevy;
  const netSalary = grossMonthlySalary - totalDeductions;

  return {
    grossSalary: grossMonthlySalary,
    nssfTierI: nssf.tierI,
    nssfTierII: nssf.tierII,
    nssfTotal: nssf.total,
    shif,
    housingLevy,
    taxableIncome,
    grossTax: payeResult.grossTax,
    personalRelief: payeResult.personalRelief,
    paye: payeResult.paye,
    totalDeductions,
    netSalary,
  };
}

import type { TaxSummary, TakeHomeResult, ExpenseItem } from "./take-home-types.js";

// ---------------------------------------------------------------------------
// Aggregator params
// ---------------------------------------------------------------------------

export type AggregateParams = {
  grossSalary: number;
  taxBreakdown: TaxSummary;
  rentCost: { amount: number; source: string; confidence: string };
  foodCost: { amount: number; source: string; confidence: string };
  transportCost: { amount: number; source: string; confidence: string; mode: string };
  customExpenses: { label: string; amountKES: number }[];
  submissionId: string;
};

// ---------------------------------------------------------------------------
// Pure aggregator
// ---------------------------------------------------------------------------

export function aggregateTakeHome(params: AggregateParams): TakeHomeResult {
  const {
    grossSalary,
    taxBreakdown,
    rentCost,
    foodCost,
    transportCost,
    customExpenses,
    submissionId,
  } = params;

  const expenses: ExpenseItem[] = [];

  // Tax line items
  expenses.push({
    category: "tax",
    label: "PAYE",
    amountKES: taxBreakdown.paye,
    source: "live",
    confidence: "high",
    isEditable: false,
  });

  expenses.push({
    category: "tax",
    label: "NSSF",
    amountKES: taxBreakdown.nssfTotal,
    source: "live",
    confidence: "high",
    isEditable: false,
  });

  expenses.push({
    category: "tax",
    label: "SHIF",
    amountKES: taxBreakdown.shif,
    source: "live",
    confidence: "high",
    isEditable: false,
  });

  expenses.push({
    category: "tax",
    label: "Housing Levy",
    amountKES: taxBreakdown.housingLevy,
    source: "live",
    confidence: "high",
    isEditable: false,
  });

  // Living cost items
  expenses.push({
    category: "rent",
    label: "Rent",
    amountKES: rentCost.amount,
    source: rentCost.source as ExpenseItem["source"],
    confidence: rentCost.confidence as ExpenseItem["confidence"],
    isEditable: true,
  });

  expenses.push({
    category: "food",
    label: "Food",
    amountKES: foodCost.amount,
    source: foodCost.source as ExpenseItem["source"],
    confidence: foodCost.confidence as ExpenseItem["confidence"],
    isEditable: true,
  });

  expenses.push({
    category: "transport",
    label: `Transport (${transportCost.mode})`,
    amountKES: transportCost.amount,
    source: transportCost.source as ExpenseItem["source"],
    confidence: transportCost.confidence as ExpenseItem["confidence"],
    isEditable: true,
  });

  // Custom expenses
  for (const custom of customExpenses) {
    expenses.push({
      category: "custom",
      label: custom.label,
      amountKES: custom.amountKES,
      source: "manual",
      confidence: "high",
      isEditable: true,
    });
  }

  // Compute totals
  const totalTax =
    taxBreakdown.paye +
    taxBreakdown.nssfTotal +
    taxBreakdown.shif +
    taxBreakdown.housingLevy;

  const totalLivingCosts =
    rentCost.amount + foodCost.amount + transportCost.amount;

  const totalCustomExpenses = customExpenses.reduce(
    (sum, c) => sum + c.amountKES,
    0,
  );

  const totalDeductions = totalTax + totalLivingCosts + totalCustomExpenses;
  const takeHomeSalary = grossSalary - totalDeductions;

  const now = Date.now();

  return {
    submissionId,
    grossSalary,
    taxBreakdown,
    expenses,
    totalTax,
    totalLivingCosts,
    totalCustomExpenses,
    totalDeductions,
    takeHomeSalary,
    calculatedAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };
}

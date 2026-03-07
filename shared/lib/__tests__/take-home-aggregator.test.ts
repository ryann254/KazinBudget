import { describe, it, expect } from "vitest";
import { aggregateTakeHome } from "../take-home-aggregator.js";
import type { TaxSummary } from "../take-home-types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTaxBreakdown(overrides: Partial<TaxSummary> = {}): TaxSummary {
  return {
    paye: 0,
    nssfTotal: 0,
    shif: 0,
    housingLevy: 0,
    totalTax: 0,
    taxableIncome: 0,
    personalRelief: 2_400,
    ...overrides,
  };
}

function makeDefaultCosts() {
  return {
    rentCost: { amount: 0, source: "live", confidence: "high" },
    foodCost: { amount: 0, source: "live", confidence: "medium" },
    transportCost: { amount: 0, source: "live", confidence: "medium", mode: "matatu" },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("aggregateTakeHome", () => {
  it("basic: gross 100,000 with realistic deductions => correct take-home", () => {
    const tax = makeTaxBreakdown({
      paye: 14_000,
      nssfTotal: 4_000,
      shif: 1_500,
      housingLevy: 500,
      totalTax: 20_000,
      taxableIncome: 80_000,
    });

    const result = aggregateTakeHome({
      grossSalary: 100_000,
      taxBreakdown: tax,
      rentCost: { amount: 15_000, source: "live", confidence: "high" },
      foodCost: { amount: 8_800, source: "cached", confidence: "medium" },
      transportCost: { amount: 4_400, source: "fallback", confidence: "low", mode: "matatu" },
      customExpenses: [],
      submissionId: "sub-basic",
    });

    const expectedTotalTax = 14_000 + 4_000 + 1_500 + 500; // 20_000
    const expectedLiving = 15_000 + 8_800 + 4_400; // 28_200
    const expectedDeductions = expectedTotalTax + expectedLiving; // 48_200
    const expectedTakeHome = 100_000 - expectedDeductions; // 51_800

    expect(result.totalTax).toBe(expectedTotalTax);
    expect(result.totalLivingCosts).toBe(expectedLiving);
    expect(result.totalCustomExpenses).toBe(0);
    expect(result.totalDeductions).toBe(expectedDeductions);
    expect(result.takeHomeSalary).toBe(expectedTakeHome);
    expect(result.submissionId).toBe("sub-basic");
  });

  it("zero salary: all zero => take-home 0", () => {
    const tax = makeTaxBreakdown();
    const costs = makeDefaultCosts();

    const result = aggregateTakeHome({
      grossSalary: 0,
      taxBreakdown: tax,
      ...costs,
      customExpenses: [],
      submissionId: "sub-zero",
    });

    expect(result.grossSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.totalLivingCosts).toBe(0);
    expect(result.totalCustomExpenses).toBe(0);
    expect(result.totalDeductions).toBe(0);
    expect(result.takeHomeSalary).toBe(0);
  });

  it("deductions exceed salary: gross 30,000 with high deductions => negative take-home", () => {
    const tax = makeTaxBreakdown({
      paye: 5_000,
      nssfTotal: 3_000,
      shif: 1_000,
      housingLevy: 500,
      totalTax: 9_500,
      taxableIncome: 20_500,
    });

    const result = aggregateTakeHome({
      grossSalary: 30_000,
      taxBreakdown: tax,
      rentCost: { amount: 15_000, source: "live", confidence: "high" },
      foodCost: { amount: 8_800, source: "live", confidence: "medium" },
      transportCost: { amount: 4_400, source: "live", confidence: "medium", mode: "matatu" },
      customExpenses: [],
      submissionId: "sub-negative",
    });

    const expectedTotalTax = 5_000 + 3_000 + 1_000 + 500; // 9_500
    const expectedLiving = 15_000 + 8_800 + 4_400; // 28_200
    const expectedDeductions = expectedTotalTax + expectedLiving; // 37_700

    expect(result.totalDeductions).toBe(expectedDeductions);
    expect(result.takeHomeSalary).toBe(30_000 - expectedDeductions);
    expect(result.takeHomeSalary).toBeLessThan(0);
  });

  it("with custom expenses: add gym 3,000 and utilities 2,000", () => {
    const tax = makeTaxBreakdown({
      paye: 10_000,
      nssfTotal: 3_000,
      shif: 1_000,
      housingLevy: 500,
      totalTax: 14_500,
      taxableIncome: 70_500,
    });

    const result = aggregateTakeHome({
      grossSalary: 80_000,
      taxBreakdown: tax,
      rentCost: { amount: 12_000, source: "live", confidence: "high" },
      foodCost: { amount: 7_000, source: "live", confidence: "medium" },
      transportCost: { amount: 3_000, source: "live", confidence: "medium", mode: "boda" },
      customExpenses: [
        { label: "Gym", amountKES: 3_000 },
        { label: "Utilities", amountKES: 2_000 },
      ],
      submissionId: "sub-custom",
    });

    expect(result.totalCustomExpenses).toBe(5_000);
    expect(result.totalTax).toBe(14_500);
    expect(result.totalLivingCosts).toBe(22_000);
    expect(result.totalDeductions).toBe(14_500 + 22_000 + 5_000);
    expect(result.takeHomeSalary).toBe(80_000 - result.totalDeductions);
  });

  it("invariant: totalDeductions + takeHomeSalary === grossSalary", () => {
    const tax = makeTaxBreakdown({
      paye: 19_812.45,
      nssfTotal: 4_320,
      shif: 2_750,
      housingLevy: 1_500,
      totalTax: 28_382.45,
      taxableIncome: 91_430,
    });

    const result = aggregateTakeHome({
      grossSalary: 100_000,
      taxBreakdown: tax,
      rentCost: { amount: 15_000, source: "live", confidence: "high" },
      foodCost: { amount: 8_800, source: "cached", confidence: "medium" },
      transportCost: { amount: 4_400, source: "fallback", confidence: "low", mode: "matatu" },
      customExpenses: [{ label: "Netflix", amountKES: 1_500 }],
      submissionId: "sub-invariant",
    });

    expect(result.totalDeductions + result.takeHomeSalary).toBeCloseTo(
      result.grossSalary,
      2,
    );
  });

  it("invariant: totalDeductions === totalTax + totalLivingCosts + totalCustomExpenses", () => {
    const tax = makeTaxBreakdown({
      paye: 10_000,
      nssfTotal: 3_500,
      shif: 1_200,
      housingLevy: 800,
      totalTax: 15_500,
      taxableIncome: 60_000,
    });

    const result = aggregateTakeHome({
      grossSalary: 75_000,
      taxBreakdown: tax,
      rentCost: { amount: 10_000, source: "live", confidence: "high" },
      foodCost: { amount: 6_000, source: "live", confidence: "medium" },
      transportCost: { amount: 3_000, source: "live", confidence: "medium", mode: "uber" },
      customExpenses: [
        { label: "Internet", amountKES: 2_500 },
        { label: "Gym", amountKES: 3_000 },
      ],
      submissionId: "sub-invariant-2",
    });

    expect(result.totalDeductions).toBe(
      result.totalTax + result.totalLivingCosts + result.totalCustomExpenses,
    );
  });

  it("expenses array has correct number of items (4 tax + 3 living + N custom)", () => {
    const tax = makeTaxBreakdown({
      paye: 5_000,
      nssfTotal: 2_000,
      shif: 800,
      housingLevy: 400,
    });

    const customExpenses = [
      { label: "Gym", amountKES: 3_000 },
      { label: "Utilities", amountKES: 2_000 },
    ];

    const result = aggregateTakeHome({
      grossSalary: 50_000,
      taxBreakdown: tax,
      rentCost: { amount: 10_000, source: "live", confidence: "high" },
      foodCost: { amount: 6_000, source: "live", confidence: "medium" },
      transportCost: { amount: 2_500, source: "live", confidence: "medium", mode: "matatu" },
      customExpenses,
      submissionId: "sub-count",
    });

    // 4 tax + 3 living + 2 custom = 9
    expect(result.expenses).toHaveLength(4 + 3 + customExpenses.length);
  });

  it("each expense has valid category, source, confidence", () => {
    const validCategories = ["tax", "rent", "food", "transport", "custom"];
    const validSources = ["live", "cached", "fallback", "manual", "unavailable"];
    const validConfidences = ["high", "medium", "low"];

    const tax = makeTaxBreakdown({
      paye: 8_000,
      nssfTotal: 3_000,
      shif: 1_000,
      housingLevy: 600,
    });

    const result = aggregateTakeHome({
      grossSalary: 60_000,
      taxBreakdown: tax,
      rentCost: { amount: 12_000, source: "live", confidence: "high" },
      foodCost: { amount: 7_000, source: "cached", confidence: "medium" },
      transportCost: { amount: 3_500, source: "fallback", confidence: "low", mode: "brt" },
      customExpenses: [{ label: "Savings", amountKES: 5_000 }],
      submissionId: "sub-valid",
    });

    for (const expense of result.expenses) {
      expect(validCategories).toContain(expense.category);
      expect(validSources).toContain(expense.source);
      expect(validConfidences).toContain(expense.confidence);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  createBudgetFingerprint,
  hasImpactfulBudgetChange,
  type BudgetFingerprintInput,
} from "../budget-fingerprint.js";

const BASE_INPUT: BudgetFingerprintInput = {
  grossSalary: 120_000,
  workLocation: "Westlands, Nairobi",
  homeArea: "Juja, Kiambu",
  expenseItems: [
    { name: "Rent", category: "rent", amount: 15_000 },
    { name: "Food", category: "food", amount: 8_800 },
  ],
  assumptions: {
    salaryGrowthRate: 7.5,
    transportMode: "matatu",
  },
};

describe("createBudgetFingerprint", () => {
  it("returns the same fingerprint for semantically identical input", () => {
    const variant: BudgetFingerprintInput = {
      grossSalary: 120_000,
      workLocation: "  WESTLANDS,   NAIROBI ",
      homeArea: "Juja,   Kiambu",
      expenseItems: [
        { name: " food ", category: "FOOD", amount: 8_800 },
        { name: "rent", category: "rent", amount: 15_000 },
      ],
      assumptions: {
        transportMode: "matatu",
        salaryGrowthRate: 7.5,
      },
    };

    expect(createBudgetFingerprint(variant)).toBe(
      createBudgetFingerprint(BASE_INPUT),
    );
  });

  it("changes when salary changes", () => {
    const changed = {
      ...BASE_INPUT,
      grossSalary: 130_000,
    };

    expect(createBudgetFingerprint(changed)).not.toBe(
      createBudgetFingerprint(BASE_INPUT),
    );
  });

  it("changes when locations change", () => {
    const changed = {
      ...BASE_INPUT,
      homeArea: "Ruiru, Kiambu",
    };

    expect(createBudgetFingerprint(changed)).not.toBe(
      createBudgetFingerprint(BASE_INPUT),
    );
  });

  it("changes when expense amount changes", () => {
    const changed = {
      ...BASE_INPUT,
      expenseItems: [
        { name: "Rent", category: "rent", amount: 16_000 },
        { name: "Food", category: "food", amount: 8_800 },
      ],
    };

    expect(createBudgetFingerprint(changed)).not.toBe(
      createBudgetFingerprint(BASE_INPUT),
    );
  });

  it("changes when assumptions change", () => {
    const changed = {
      ...BASE_INPUT,
      assumptions: {
        ...BASE_INPUT.assumptions,
        salaryGrowthRate: 8.0,
      },
    };

    expect(createBudgetFingerprint(changed)).not.toBe(
      createBudgetFingerprint(BASE_INPUT),
    );
  });
});

describe("hasImpactfulBudgetChange", () => {
  it("returns false for equivalent inputs", () => {
    const same: BudgetFingerprintInput = {
      ...BASE_INPUT,
      workLocation: " westlands, nairobi ",
    };

    expect(hasImpactfulBudgetChange(BASE_INPUT, same)).toBe(false);
  });

  it("returns true for changed inputs", () => {
    const changed = {
      ...BASE_INPUT,
      grossSalary: 125_000,
    };

    expect(hasImpactfulBudgetChange(BASE_INPUT, changed)).toBe(true);
  });
});

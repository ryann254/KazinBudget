import { describe, it, expect } from "vitest";
import {
  projectYear,
  projectAll,
  getMilestones,
  type ProjectionInput,
  type YearProjection,
} from "../projections.js";
import { calculateKenyanDeductions } from "../kenya-tax-calculator.js";

// ---------------------------------------------------------------------------
// Shared test inputs
// ---------------------------------------------------------------------------

const baseInput: ProjectionInput = {
  currentSalary: 100_000,
  currentRent: 25_000,
  currentFood: 15_000,
  currentTransport: 8_000,
  currentCustomExpenses: 5_000,
  salaryGrowthRate: 0.075,
  rentInflationRate: 0.04,
  foodInflationRate: 0.07,
  transportInflationRate: 0.06,
  customInflationRate: 0.065,
  generalInflationRate: 0.07,
};

const zeroGrowthInput: ProjectionInput = {
  currentSalary: 100_000,
  currentRent: 25_000,
  currentFood: 15_000,
  currentTransport: 8_000,
  currentCustomExpenses: 5_000,
  salaryGrowthRate: 0,
  rentInflationRate: 0,
  foodInflationRate: 0,
  transportInflationRate: 0,
  customInflationRate: 0,
  generalInflationRate: 0,
};

const zeroExpensesInput: ProjectionInput = {
  currentSalary: 100_000,
  currentRent: 0,
  currentFood: 0,
  currentTransport: 0,
  currentCustomExpenses: 0,
  salaryGrowthRate: 0.075,
  rentInflationRate: 0,
  foodInflationRate: 0,
  transportInflationRate: 0,
  customInflationRate: 0,
  generalInflationRate: 0.07,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Assert the fundamental invariant: takeHome = salary - totalTax - totalExpenses */
function assertTakeHomeInvariant(p: YearProjection) {
  const expected = round2(p.salary - p.totalTax - p.totalExpenses);
  expect(p.takeHome).toBeCloseTo(expected, 1);
}

// ---------------------------------------------------------------------------
// projectYear: year 0 returns current values unchanged
// ---------------------------------------------------------------------------

describe("projectYear: year 0 returns current values unchanged", () => {
  it("should return current salary, expenses, and taxes at year 0", () => {
    const p = projectYear(baseInput, 0);

    expect(p.year).toBe(0);
    expect(p.salary).toBe(100_000);
    expect(p.rent).toBe(25_000);
    expect(p.food).toBe(15_000);
    expect(p.transport).toBe(8_000);
    expect(p.customExpenses).toBe(5_000);

    // Taxes should match calculateKenyanDeductions for 100,000
    const tax = calculateKenyanDeductions(100_000);
    expect(p.paye).toBe(tax.paye);
    expect(p.nssf).toBe(tax.nssfTotal);
    expect(p.shif).toBe(tax.shif);
    expect(p.housingLevy).toBe(tax.housingLevy);
    expect(p.totalTax).toBeCloseTo(tax.totalDeductions, 1);

    expect(p.totalExpenses).toBe(53_000);
    assertTakeHomeInvariant(p);

    // At year 0, takeHomeReal === takeHome (deflator = 1)
    expect(p.takeHomeReal).toBe(p.takeHome);
  });
});

// ---------------------------------------------------------------------------
// projectYear: year 3 with known inputs matches expected values
// ---------------------------------------------------------------------------

describe("projectYear: year 3 with known inputs", () => {
  it("salary grows by compound growth, taxes recalculated for future salary", () => {
    const p = projectYear(baseInput, 3);

    // Salary: 100,000 * (1.075)^3
    const expectedSalary = round2(100_000 * Math.pow(1.075, 3));
    expect(p.salary).toBe(expectedSalary);

    // Rent: 25,000 * (1.04)^3
    const expectedRent = round2(25_000 * Math.pow(1.04, 3));
    expect(p.rent).toBe(expectedRent);

    // Food: 15,000 * (1.07)^3
    const expectedFood = round2(15_000 * Math.pow(1.07, 3));
    expect(p.food).toBe(expectedFood);

    // Transport: 8,000 * (1.06)^3
    const expectedTransport = round2(8_000 * Math.pow(1.06, 3));
    expect(p.transport).toBe(expectedTransport);

    // Custom: 5,000 * (1.065)^3
    const expectedCustom = round2(5_000 * Math.pow(1.065, 3));
    expect(p.customExpenses).toBe(expectedCustom);

    // Taxes should be recalculated for the future salary (bracket creep)
    const futureTax = calculateKenyanDeductions(expectedSalary);
    expect(p.paye).toBe(futureTax.paye);
    expect(p.nssf).toBe(futureTax.nssfTotal);
    expect(p.shif).toBe(futureTax.shif);
    expect(p.housingLevy).toBe(futureTax.housingLevy);

    // Salary grew, so taxes should be higher than year 0
    const year0 = projectYear(baseInput, 0);
    expect(p.totalTax).toBeGreaterThan(year0.totalTax);

    assertTakeHomeInvariant(p);
  });
});

// ---------------------------------------------------------------------------
// projectAll: returns array of length 11 (years 0-10)
// ---------------------------------------------------------------------------

describe("projectAll: returns correct number of years", () => {
  it("default: returns 11 entries (years 0 through 10)", () => {
    const projections = projectAll(baseInput);

    expect(projections).toHaveLength(11);
    expect(projections[0].year).toBe(0);
    expect(projections[10].year).toBe(10);

    // Verify each year is sequential
    for (let i = 0; i <= 10; i++) {
      expect(projections[i].year).toBe(i);
    }
  });

  it("custom years parameter: returns years + 1 entries", () => {
    const projections = projectAll(baseInput, 5);

    expect(projections).toHaveLength(6);
    expect(projections[0].year).toBe(0);
    expect(projections[5].year).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// getMilestones: extracts correct years
// ---------------------------------------------------------------------------

describe("getMilestones: extracts correct years", () => {
  it("returns year 3, 5, 7, 10 snapshots", () => {
    const projections = projectAll(baseInput);
    const milestones = getMilestones(projections);

    expect(milestones.year3.year).toBe(3);
    expect(milestones.year5.year).toBe(5);
    expect(milestones.year7.year).toBe(7);
    expect(milestones.year10.year).toBe(10);

    // Values should match direct projectYear calls
    expect(milestones.year3).toEqual(projectYear(baseInput, 3));
    expect(milestones.year5).toEqual(projectYear(baseInput, 5));
    expect(milestones.year7).toEqual(projectYear(baseInput, 7));
    expect(milestones.year10).toEqual(projectYear(baseInput, 10));
  });

  it("throws if projections do not include required years", () => {
    const shortProjections = projectAll(baseInput, 2); // only years 0-2
    expect(() => getMilestones(shortProjections)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Zero growth rate: all years have the same salary
// ---------------------------------------------------------------------------

describe("Zero growth rate: all years same salary", () => {
  it("salary stays at 100,000 for all years", () => {
    const projections = projectAll(zeroGrowthInput);

    for (const p of projections) {
      expect(p.salary).toBe(100_000);
      expect(p.rent).toBe(25_000);
      expect(p.food).toBe(15_000);
      expect(p.transport).toBe(8_000);
      expect(p.customExpenses).toBe(5_000);
    }
  });

  it("taxes are identical across all years", () => {
    const projections = projectAll(zeroGrowthInput);
    const year0Tax = projections[0].totalTax;

    for (const p of projections) {
      expect(p.totalTax).toBe(year0Tax);
    }
  });
});

// ---------------------------------------------------------------------------
// Zero expenses: takeHome = salary - taxes
// ---------------------------------------------------------------------------

describe("Zero expenses: takeHome = salary - taxes", () => {
  it("totalExpenses is 0, takeHome equals salary minus totalTax", () => {
    const projections = projectAll(zeroExpensesInput);

    for (const p of projections) {
      expect(p.rent).toBe(0);
      expect(p.food).toBe(0);
      expect(p.transport).toBe(0);
      expect(p.customExpenses).toBe(0);
      expect(p.totalExpenses).toBe(0);
      expect(p.takeHome).toBeCloseTo(p.salary - p.totalTax, 1);
    }
  });
});

// ---------------------------------------------------------------------------
// Real takeHome is less than nominal for year > 0
// ---------------------------------------------------------------------------

describe("Real takeHome is less than nominal for year > 0", () => {
  it("takeHomeReal < takeHome when generalInflationRate > 0 and year > 0", () => {
    const projections = projectAll(baseInput);

    // Year 0: takeHomeReal === takeHome
    expect(projections[0].takeHomeReal).toBe(projections[0].takeHome);

    // Year 1+: takeHomeReal < takeHome
    for (let i = 1; i < projections.length; i++) {
      expect(projections[i].takeHomeReal).toBeLessThan(
        projections[i].takeHome,
      );
    }
  });

  it("with zero inflation, takeHomeReal equals takeHome for all years", () => {
    const noInflation: ProjectionInput = {
      ...baseInput,
      generalInflationRate: 0,
    };
    const projections = projectAll(noInflation);

    for (const p of projections) {
      expect(p.takeHomeReal).toBe(p.takeHome);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant: takeHome = salary - totalTax - totalExpenses
// ---------------------------------------------------------------------------

describe("Invariant: takeHome = salary - totalTax - totalExpenses", () => {
  it("holds for all years with base input", () => {
    const projections = projectAll(baseInput);

    for (const p of projections) {
      assertTakeHomeInvariant(p);
    }
  });

  it("holds for all years with zero growth input", () => {
    const projections = projectAll(zeroGrowthInput);

    for (const p of projections) {
      assertTakeHomeInvariant(p);
    }
  });

  it("holds for all years with zero expenses input", () => {
    const projections = projectAll(zeroExpensesInput);

    for (const p of projections) {
      assertTakeHomeInvariant(p);
    }
  });
});

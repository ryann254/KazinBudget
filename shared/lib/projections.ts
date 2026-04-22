import { calculateKenyanDeductions } from "./kenya-tax-calculator.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProjectionInput = {
  currentSalary: number;
  currentRent: number;
  currentFood: number;
  currentTransport: number;
  currentCustomExpenses: number;
  salaryGrowthRate: number; // e.g. 0.075
  rentInflationRate: number; // e.g. 0.04
  foodInflationRate: number; // e.g. 0.07
  transportInflationRate: number; // e.g. 0.06
  customInflationRate: number; // e.g. 0.065
  generalInflationRate: number; // e.g. 0.07
};

export type YearProjection = {
  year: number;
  salary: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  totalTax: number;
  rent: number;
  food: number;
  transport: number;
  customExpenses: number;
  totalExpenses: number;
  takeHome: number;
  takeHomeReal: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function compoundGrowth(base: number, rate: number, year: number): number {
  return base * Math.pow(1 + rate, year);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Projection functions
// ---------------------------------------------------------------------------

export function projectYear(
  input: ProjectionInput,
  year: number,
): YearProjection {
  const salary = round2(compoundGrowth(input.currentSalary, input.salaryGrowthRate, year));
  const rent = round2(compoundGrowth(input.currentRent, input.rentInflationRate, year));
  const food = round2(compoundGrowth(input.currentFood, input.foodInflationRate, year));
  const transport = round2(compoundGrowth(input.currentTransport, input.transportInflationRate, year));
  const customExpenses = round2(compoundGrowth(input.currentCustomExpenses, input.customInflationRate, year));

  const taxBreakdown = calculateKenyanDeductions(salary);

  const paye = taxBreakdown.paye;
  const nssf = taxBreakdown.nssfTotal;
  const shif = taxBreakdown.shif;
  const housingLevy = taxBreakdown.housingLevy;
  const totalTax = round2(paye + nssf + shif + housingLevy);

  const totalExpenses = round2(rent + food + transport + customExpenses);
  const takeHome = round2(salary - totalTax - totalExpenses);
  const deflator = Math.pow(1 + input.generalInflationRate, year);
  const takeHomeReal = round2(takeHome / deflator);

  return {
    year,
    salary,
    paye,
    nssf,
    shif,
    housingLevy,
    totalTax,
    rent,
    food,
    transport,
    customExpenses,
    totalExpenses,
    takeHome,
    takeHomeReal,
  };
}

export function projectAll(
  input: ProjectionInput,
  years: number = 10,
): YearProjection[] {
  const projections: YearProjection[] = [];
  for (let y = 0; y <= years; y++) {
    projections.push(projectYear(input, y));
  }
  return projections;
}

export function getMilestones(projections: YearProjection[]): {
  year3: YearProjection;
  year5: YearProjection;
  year7: YearProjection;
  year10: YearProjection;
} {
  const byYear = new Map(projections.map((p) => [p.year, p]));

  const year3 = byYear.get(3);
  const year5 = byYear.get(5);
  const year7 = byYear.get(7);
  const year10 = byYear.get(10);

  if (!year3 || !year5 || !year7 || !year10) {
    throw new Error(
      "Projections must include years 3, 5, 7, and 10 for milestones",
    );
  }

  return { year3, year5, year7, year10 };
}

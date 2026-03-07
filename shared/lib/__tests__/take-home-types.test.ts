import { describe, it, expect } from "vitest";
import {
  TakeHomeInputSchema,
  ExpenseItemSchema,
  TakeHomeResultSchema,
  TaxSummarySchema,
} from "../take-home-types.js";

// ---------------------------------------------------------------------------
// TakeHomeInputSchema
// ---------------------------------------------------------------------------

describe("TakeHomeInputSchema", () => {
  const validInput = {
    submissionId: "sub-001",
    name: "Jane Doe",
    companyName: "Acme Corp",
    companyLocation: "Nairobi CBD",
    companyLat: -1.2921,
    companyLng: 36.8219,
    residentialArea: "Westlands",
    yearsOfExperience: 5,
    monthlyGrossSalary: 100_000,
    bedroomPreference: "1br" as const,
    transportMode: "matatu" as const,
  };

  it("valid TakeHomeInput with all fields passes", () => {
    const result = TakeHomeInputSchema.parse(validInput);
    expect(result.submissionId).toBe("sub-001");
    expect(result.monthlyGrossSalary).toBe(100_000);
    expect(result.bedroomPreference).toBe("1br");
    expect(result.transportMode).toBe("matatu");
  });

  it("missing monthlyGrossSalary fails", () => {
    const { monthlyGrossSalary: _, ...incomplete } = validInput;
    expect(() => TakeHomeInputSchema.parse(incomplete)).toThrow();
  });

  it("negative salary fails", () => {
    expect(() =>
      TakeHomeInputSchema.parse({ ...validInput, monthlyGrossSalary: -5000 }),
    ).toThrow();
  });

  it("bedroomPreference defaults to '1br' when omitted", () => {
    const { bedroomPreference: _, ...withoutBedroom } = validInput;
    const result = TakeHomeInputSchema.parse(withoutBedroom);
    expect(result.bedroomPreference).toBe("1br");
  });

  it("transportMode defaults to 'matatu' when omitted", () => {
    const { transportMode: _, ...withoutTransport } = validInput;
    const result = TakeHomeInputSchema.parse(withoutTransport);
    expect(result.transportMode).toBe("matatu");
  });

  it("invalid bedroomPreference '5br' fails", () => {
    expect(() =>
      TakeHomeInputSchema.parse({ ...validInput, bedroomPreference: "5br" }),
    ).toThrow();
  });

  it("invalid transportMode 'helicopter' fails", () => {
    expect(() =>
      TakeHomeInputSchema.parse({ ...validInput, transportMode: "helicopter" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ExpenseItemSchema
// ---------------------------------------------------------------------------

describe("ExpenseItemSchema", () => {
  const validExpense = {
    category: "rent" as const,
    label: "Monthly Rent",
    amountKES: 15_000,
    source: "live" as const,
    confidence: "high" as const,
    isEditable: true,
  };

  it("valid ExpenseItem passes", () => {
    const result = ExpenseItemSchema.parse(validExpense);
    expect(result.category).toBe("rent");
    expect(result.amountKES).toBe(15_000);
  });

  it("amountKES below 0 fails", () => {
    expect(() =>
      ExpenseItemSchema.parse({ ...validExpense, amountKES: -100 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// TakeHomeResultSchema
// ---------------------------------------------------------------------------

describe("TakeHomeResultSchema", () => {
  const validTaxBreakdown = {
    paye: 19_812.45,
    nssfTotal: 4_320,
    shif: 2_750,
    housingLevy: 1_500,
    totalTax: 28_382.45,
    taxableIncome: 91_430,
    personalRelief: 2_400,
  };

  const validResult = {
    submissionId: "sub-001",
    grossSalary: 100_000,
    taxBreakdown: validTaxBreakdown,
    expenses: [
      {
        category: "tax" as const,
        label: "PAYE",
        amountKES: 19_812.45,
        source: "live" as const,
        confidence: "high" as const,
        isEditable: false,
      },
    ],
    totalTax: 28_382.45,
    totalLivingCosts: 28_200,
    totalCustomExpenses: 0,
    totalDeductions: 56_582.45,
    takeHomeSalary: 43_417.55,
    calculatedAt: Date.now(),
    expiresAt: Date.now() + 86_400_000,
  };

  it("valid TakeHomeResult passes", () => {
    const result = TakeHomeResultSchema.parse(validResult);
    expect(result.submissionId).toBe("sub-001");
    expect(result.grossSalary).toBe(100_000);
    expect(result.taxBreakdown.paye).toBe(19_812.45);
  });

  it("TakeHomeResult with missing taxBreakdown fails", () => {
    const { taxBreakdown: _, ...withoutTax } = validResult;
    expect(() => TakeHomeResultSchema.parse(withoutTax)).toThrow();
  });
});

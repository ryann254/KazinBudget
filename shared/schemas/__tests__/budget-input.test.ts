import { describe, expect, it } from "vitest";
import { BudgetInputSchema } from "../budget-input.js";

const VALID_INPUT = {
  fullName: "Amani Wanjiku",
  company: "Safaricom PLC",
  workLocation: "Westlands, Nairobi",
  homeArea: "Juja, Kiambu",
  grossSalary: 120_000,
  experienceYears: 3,
};

describe("BudgetInputSchema", () => {
  it("accepts valid input", () => {
    const result = BudgetInputSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  it("fails when fullName is empty", () => {
    const result = BudgetInputSchema.safeParse({ ...VALID_INPUT, fullName: "" });
    expect(result.success).toBe(false);
  });

  it("fails when company is empty", () => {
    const result = BudgetInputSchema.safeParse({ ...VALID_INPUT, company: "" });
    expect(result.success).toBe(false);
  });

  it("fails when workLocation is empty", () => {
    const result = BudgetInputSchema.safeParse({
      ...VALID_INPUT,
      workLocation: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when homeArea is empty", () => {
    const result = BudgetInputSchema.safeParse({ ...VALID_INPUT, homeArea: "" });
    expect(result.success).toBe(false);
  });

  it("fails when grossSalary is zero", () => {
    const result = BudgetInputSchema.safeParse({ ...VALID_INPUT, grossSalary: 0 });
    expect(result.success).toBe(false);
  });

  it("fails when grossSalary is negative", () => {
    const result = BudgetInputSchema.safeParse({
      ...VALID_INPUT,
      grossSalary: -1_000,
    });
    expect(result.success).toBe(false);
  });

  it("fails when experienceYears is decimal", () => {
    const result = BudgetInputSchema.safeParse({
      ...VALID_INPUT,
      experienceYears: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("fails when experienceYears is negative", () => {
    const result = BudgetInputSchema.safeParse({
      ...VALID_INPUT,
      experienceYears: -1,
    });
    expect(result.success).toBe(false);
  });
});

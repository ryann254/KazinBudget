import { describe, it, expect } from "vitest";
import { submissionSchema } from "../submission.js";

const VALID_INPUT = {
  name: "Jane Doe",
  companyName: "Acme Corp",
  companyLocation: "Westlands",
  residentialArea: "Kilimani",
  yearsOfExperience: 5,
  monthlyGrossSalary: 150_000,
};

describe("submissionSchema", () => {
  it("valid input passes", () => {
    const result = submissionSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  // ---- name ----

  it("empty name fails", () => {
    const result = submissionSchema.safeParse({ ...VALID_INPUT, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Name must be at least 2 characters",
      );
    }
  });

  it("name under 2 chars fails", () => {
    const result = submissionSchema.safeParse({ ...VALID_INPUT, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Name must be at least 2 characters",
      );
    }
  });

  // ---- companyName ----

  it("empty company name fails", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      companyName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Company name is required");
    }
  });

  // ---- yearsOfExperience ----

  it("negative years of experience fails", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      yearsOfExperience: -1,
    });
    expect(result.success).toBe(false);
  });

  it("decimal years of experience fails", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      yearsOfExperience: 3.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Must be a whole number");
    }
  });

  // ---- monthlyGrossSalary ----

  it("zero salary fails", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      monthlyGrossSalary: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Salary must be positive");
    }
  });

  it("negative salary fails", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      monthlyGrossSalary: -50_000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Salary must be positive");
    }
  });

  it("salary above max fails", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      monthlyGrossSalary: 100_000_001,
    });
    expect(result.success).toBe(false);
  });

  // ---- missing fields ----

  it("missing fields fail", () => {
    const result = submissionSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(6);
    }
  });

  // ---- boundary values ----

  it("0 years of experience passes", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      yearsOfExperience: 0,
    });
    expect(result.success).toBe(true);
  });

  it("50 years of experience passes", () => {
    const result = submissionSchema.safeParse({
      ...VALID_INPUT,
      yearsOfExperience: 50,
    });
    expect(result.success).toBe(true);
  });
});

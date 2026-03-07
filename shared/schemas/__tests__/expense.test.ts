import { describe, it, expect } from "vitest";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseCategorySchema,
} from "../expense.js";

const VALID_EXPENSE = {
  name: "Gym Membership",
  category: "custom" as const,
  amount: 3_000,
  description: "Monthly gym subscription",
};

describe("createExpenseSchema", () => {
  it("valid expense passes", () => {
    const result = createExpenseSchema.safeParse(VALID_EXPENSE);
    expect(result.success).toBe(true);
  });

  it("empty name fails", () => {
    const result = createExpenseSchema.safeParse({
      ...VALID_EXPENSE,
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("negative amount fails", () => {
    const result = createExpenseSchema.safeParse({
      ...VALID_EXPENSE,
      amount: -100,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Amount must be non-negative",
      );
    }
  });

  it("amount over 10M fails", () => {
    const result = createExpenseSchema.safeParse({
      ...VALID_EXPENSE,
      amount: 10_000_001,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Amount must be at most 10,000,000",
      );
    }
  });

  it("unknown category fails", () => {
    const result = createExpenseSchema.safeParse({
      ...VALID_EXPENSE,
      category: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("valid categories all pass", () => {
    const categories = ["tax", "rent", "food", "transport", "custom"] as const;
    for (const category of categories) {
      const result = expenseCategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    }
  });
});

describe("updateExpenseSchema", () => {
  it("allows partial fields", () => {
    const result = updateExpenseSchema.safeParse({
      id: "expense-1",
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("requires id field", () => {
    const result = updateExpenseSchema.safeParse({
      name: "Updated Name",
    });
    expect(result.success).toBe(false);
  });

  it("empty id fails", () => {
    const result = updateExpenseSchema.safeParse({
      id: "",
      name: "Updated Name",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("ID is required");
    }
  });
});

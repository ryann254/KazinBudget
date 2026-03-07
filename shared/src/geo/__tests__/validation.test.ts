import { describe, it, expect } from "vitest";
import { locationSchema, resolvedLocationSchema } from "../validation";

describe("locationSchema", () => {
  it("valid location passes", () => {
    const result = locationSchema.safeParse("Westlands");
    expect(result.success).toBe(true);
  });

  it("valid location passes for another area", () => {
    const result = locationSchema.safeParse("Kilimani");
    expect(result.success).toBe(true);
  });

  it('invalid location "Mombasa" fails with correct error message', () => {
    const result = locationSchema.safeParse("Mombasa");
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        "We're not in this area yet. Please select a supported Nairobi location.",
      );
    }
  });

  it('empty string fails with "Location is required"', () => {
    const result = locationSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Location is required");
    }
  });
});

describe("resolvedLocationSchema", () => {
  it('transforms "Westlands" into { name: "Westlands", zone: "PREMIUM" }', () => {
    const result = resolvedLocationSchema.safeParse("Westlands");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Westlands", zone: "PREMIUM" });
    }
  });

  it('transforms "juja" into { name: "Juja", zone: "SATELLITE" }', () => {
    const result = resolvedLocationSchema.safeParse("juja");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Juja", zone: "SATELLITE" });
    }
  });

  it('rejects "Nakuru"', () => {
    const result = resolvedLocationSchema.safeParse("Nakuru");
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        "We're not in this area yet. Please select a supported Nairobi location.",
      );
    }
  });

  it("rejects empty string", () => {
    const result = resolvedLocationSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Location is required");
    }
  });
});

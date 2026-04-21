import { describe, expect, it } from "vitest";
import {
  compareSalary,
  experienceBandFor,
} from "../salary-comparison.js";

describe("experienceBandFor", () => {
  it("maps 0-2 years to Entry", () => {
    expect(experienceBandFor(0)).toBe("Entry (0-2 years)");
    expect(experienceBandFor(2)).toBe("Entry (0-2 years)");
  });
  it("maps 3-5 years to Mid-Level", () => {
    expect(experienceBandFor(3)).toBe("Mid-Level (3-5 years)");
    expect(experienceBandFor(5)).toBe("Mid-Level (3-5 years)");
  });
  it("maps 6-9 years to Senior", () => {
    expect(experienceBandFor(9)).toBe("Senior (6-9 years)");
  });
  it("maps 10+ to Lead", () => {
    expect(experienceBandFor(10)).toBe("Lead (10+ years)");
    expect(experienceBandFor(25)).toBe("Lead (10+ years)");
  });
});

describe("compareSalary", () => {
  const BASE = {
    jobTitle: "Software Engineer",
    experienceYears: 3,
    workLocation: "Westlands, Nairobi",
  };

  it("returns median and p25/p75 bracketing the median", () => {
    const r = compareSalary({ ...BASE, userSalary: 150_000 });
    expect(r.p25).toBeLessThan(r.marketMedian);
    expect(r.marketMedian).toBeLessThan(r.p75);
  });

  it("scales median by experience band", () => {
    const entry = compareSalary({ ...BASE, userSalary: 100_000, experienceYears: 1 });
    const senior = compareSalary({ ...BASE, userSalary: 100_000, experienceYears: 8 });
    expect(senior.marketMedian).toBeGreaterThan(entry.marketMedian);
  });

  it("verdict 'below' when 10% under median", () => {
    const r = compareSalary({ ...BASE, userSalary: 100_000 });
    expect(r.verdict).toBe("below");
    expect(r.verdictText).toMatch(/below/i);
  });

  it("verdict 'above' when 20% over median", () => {
    const r = compareSalary({ ...BASE, userSalary: 250_000 });
    expect(r.verdict).toBe("above");
    expect(r.verdictText).toMatch(/above/i);
  });

  it("percentile between 1 and 99", () => {
    const low = compareSalary({ ...BASE, userSalary: 10_000 });
    const high = compareSalary({ ...BASE, userSalary: 10_000_000 });
    expect(low.percentile).toBeGreaterThanOrEqual(1);
    expect(high.percentile).toBeLessThanOrEqual(99);
  });

  it("distribution contains >10 points and is unimodal-ish", () => {
    const r = compareSalary({ ...BASE, userSalary: 150_000 });
    expect(r.distribution.length).toBeGreaterThan(10);
    const maxIdx = r.distribution.reduce(
      (best, d, i, arr) => (d.frequency > arr[best].frequency ? i : best),
      0,
    );
    expect(maxIdx).toBeGreaterThan(0);
    expect(maxIdx).toBeLessThan(r.distribution.length - 1);
  });

  it("falls back to default median for unknown title", () => {
    const r = compareSalary({ ...BASE, userSalary: 120_000, jobTitle: "Alien Overlord" });
    expect(r.marketMedian).toBeGreaterThan(0);
    expect(r.role).toBe("Alien Overlord");
  });
});

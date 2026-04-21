import { describe, expect, it } from "vitest";
import {
  estimateCommute,
  estimateFood,
  estimateRent,
} from "../area-estimates.js";

describe("estimateRent", () => {
  it("returns SATELLITE pricing for Juja", () => {
    const r = estimateRent("Juja");
    expect(r.zone).toBe("SATELLITE");
    expect(r.area).toBe("Juja");
    expect(r.options).toHaveLength(3);
    expect(r.options[0].type).toBe("Bedsitter");
  });

  it("returns PREMIUM pricing for Westlands", () => {
    const r = estimateRent("Westlands");
    expect(r.zone).toBe("PREMIUM");
    // Premium bedsitter should be more expensive than satellite
    expect(r.options[0].median).toBeGreaterThan(
      estimateRent("Juja").options[0].median,
    );
  });

  it("falls back to SATELLITE for unknown area", () => {
    const r = estimateRent("Narnia");
    expect(r.zone).toBe("SATELLITE");
  });

  it("strips comma suffix from area string", () => {
    const r = estimateRent("Juja, Kiambu");
    expect(r.area).toBe("Juja");
  });
});

describe("estimateFood", () => {
  it("returns 5 PREMIUM options for Westlands", () => {
    const f = estimateFood("Westlands, Nairobi");
    expect(f.zone).toBe("PREMIUM");
    expect(f.options).toHaveLength(5);
    expect(f.options.some((o) => o.name === "Java House")).toBe(true);
  });

  it("returns SATELLITE options for Juja", () => {
    const f = estimateFood("Juja");
    expect(f.zone).toBe("SATELLITE");
    expect(f.options).toHaveLength(5);
  });

  it("falls back to MIDDLE for unknown area", () => {
    const f = estimateFood("Atlantis");
    expect(f.zone).toBe("MIDDLE");
    expect(f.options).toHaveLength(5);
  });
});

describe("estimateCommute", () => {
  it("Juja -> Westlands returns non-trivial distance and 4 modes", () => {
    const c = estimateCommute("Juja, Kiambu", "Westlands, Nairobi");
    expect(c.origin).toBe("Juja");
    expect(c.destination).toBe("Westlands");
    expect(c.distanceKm).toBeGreaterThan(10);
    expect(c.modes).toHaveLength(4);
    expect(c.modes[0].mode).toBe("Matatu");
    expect(c.modes[2].mode).toBe("Uber/Bolt");
  });

  it("shorter commute means cheaper monthly cost for Uber", () => {
    const far = estimateCommute("Juja", "Westlands");
    const near = estimateCommute("Kilimani", "Westlands");
    expect(near.modes[2].monthly).toBeLessThan(far.modes[2].monthly);
  });

  it("Uber cost is higher than matatu at same distance", () => {
    const c = estimateCommute("Kasarani", "CBD");
    const matatu = c.modes[0].monthly;
    const uber = c.modes[2].monthly;
    expect(uber).toBeGreaterThan(matatu);
  });

  it("falls back gracefully for unknown origin", () => {
    const c = estimateCommute("Mars Base", "Westlands");
    expect(c.distanceKm).toBeGreaterThanOrEqual(3);
    expect(c.modes).toHaveLength(4);
  });
});

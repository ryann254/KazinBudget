import { describe, it, expect } from "vitest";
import { searchAreas, findBestMatch, isValidArea } from "../area-matcher";

describe("searchAreas", () => {
  it('exact match: "Westlands" returns Westlands with PREMIUM zone', () => {
    const results = searchAreas("Westlands");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const westlands = results.find((r) => r.area.name === "Westlands");
    expect(westlands).toBeDefined();
    expect(westlands!.area.zone).toBe("PREMIUM");
    expect(westlands!.score).toBeLessThan(0.01);
  });

  it('fuzzy match: "Westland" (missing s) returns Westlands', () => {
    const results = searchAreas("Westland");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const westlands = results.find((r) => r.area.name === "Westlands");
    expect(westlands).toBeDefined();
  });

  it('fuzzy match: "Kilimni" (typo) returns Kilimani', () => {
    const results = searchAreas("Kilimni");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const kilimani = results.find((r) => r.area.name === "Kilimani");
    expect(kilimani).toBeDefined();
  });

  it('case insensitive: "juja" returns Juja with SATELLITE zone', () => {
    const results = searchAreas("juja");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const juja = results.find((r) => r.area.name === "Juja");
    expect(juja).toBeDefined();
    expect(juja!.area.zone).toBe("SATELLITE");
  });

  it('partial: "South" returns both South B and South C', () => {
    const results = searchAreas("South");
    const names = results.map((r) => r.area.name);
    expect(names).toContain("South B");
    expect(names).toContain("South C");
  });

  it('no match: "Mombasa" returns empty results', () => {
    const results = searchAreas("Mombasa");
    expect(results).toEqual([]);
  });

  it('no match: "Kisumu" returns empty results', () => {
    const results = searchAreas("Kisumu");
    expect(results).toEqual([]);
  });

  it("empty string returns empty array", () => {
    const results = searchAreas("");
    expect(results).toEqual([]);
  });

  it("whitespace-only input returns empty array", () => {
    const results = searchAreas("   ");
    expect(results).toEqual([]);
  });

  it('alias matching: "CBD" matches Westlands', () => {
    const results = searchAreas("CBD");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const westlands = results.find((r) => r.area.name === "Westlands");
    expect(westlands).toBeDefined();
  });

  it('alias matching: "Buru" matches Buruburu', () => {
    const results = searchAreas("Buru");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const buruburu = results.find((r) => r.area.name === "Buruburu");
    expect(buruburu).toBeDefined();
  });

  it('alias matching: "Mavoko" matches Athi River', () => {
    const results = searchAreas("Mavoko");
    expect(results.length).toBeGreaterThanOrEqual(1);
    const athiRiver = results.find((r) => r.area.name === "Athi River");
    expect(athiRiver).toBeDefined();
  });
});

describe("isValidArea", () => {
  it("returns true for exact known area", () => {
    expect(isValidArea("Westlands")).toBe(true);
  });

  it("returns true for another exact known area", () => {
    expect(isValidArea("Kilimani")).toBe(true);
  });

  it("returns true for case-insensitive exact area", () => {
    expect(isValidArea("westlands")).toBe(true);
  });

  it('returns false for unknown city "Mombasa"', () => {
    expect(isValidArea("Mombasa")).toBe(false);
  });

  it('returns false for unknown city "Kisumu"', () => {
    expect(isValidArea("Kisumu")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidArea("")).toBe(false);
  });

  it("returns false for whitespace-only input", () => {
    expect(isValidArea("   ")).toBe(false);
  });
});

describe("findBestMatch", () => {
  it("returns best match for exact area name", () => {
    const result = findBestMatch("Westlands");
    expect(result).not.toBeNull();
    expect(result!.area.name).toBe("Westlands");
    expect(result!.area.zone).toBe("PREMIUM");
  });

  it("returns null for unknown area", () => {
    const result = findBestMatch("Mombasa");
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    const result = findBestMatch("");
    expect(result).toBeNull();
  });

  it("returns null for whitespace-only input", () => {
    const result = findBestMatch("   ");
    expect(result).toBeNull();
  });
});

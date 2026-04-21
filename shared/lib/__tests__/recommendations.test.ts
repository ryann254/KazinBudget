import { describe, expect, it } from "vitest";
import { computeTopExpenseRecommendations } from "../recommendations.js";

describe("computeTopExpenseRecommendations", () => {
  it("returns the top two categories by total", () => {
    const result = computeTopExpenseRecommendations([
      {
        category: "food",
        total: 8_800,
        options: [{ label: "Current", amount: 8_800, isCurrent: true }],
      },
      {
        category: "rent",
        total: 15_000,
        options: [{ label: "1BR", amount: 15_000, isCurrent: true }],
      },
      {
        category: "transport",
        total: 6_600,
        options: [{ label: "Matatu", amount: 6_600, isCurrent: true }],
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe("rent");
    expect(result[1].category).toBe("food");
  });

  it("orders options from current to cheapest", () => {
    const [rent] = computeTopExpenseRecommendations([
      {
        category: "rent",
        total: 15_000,
        options: [
          { label: "Bedsitter", amount: 10_000 },
          { label: "1BR", amount: 15_000, isCurrent: true },
          { label: "Shared", amount: 8_000 },
          { label: "Luxury", amount: 22_000 },
        ],
      },
    ]);

    expect(rent.options.map((option) => option.label)).toEqual([
      "1BR",
      "Bedsitter",
      "Shared",
    ]);
  });

  it("caps options at the provided max", () => {
    const [food] = computeTopExpenseRecommendations(
      [
        {
          category: "food",
          total: 12_000,
          options: [
            { label: "Current", amount: 12_000, isCurrent: true },
            { label: "Option A", amount: 11_000 },
            { label: "Option B", amount: 10_000 },
            { label: "Option C", amount: 9_000 },
            { label: "Option D", amount: 8_000 },
          ],
        },
      ],
      2,
      4,
    );

    expect(food.options).toHaveLength(4);
    expect(food.options.map((option) => option.label)).toEqual([
      "Current",
      "Option A",
      "Option B",
      "Option C",
    ]);
  });

  it("uses highest option as current when no explicit current is provided", () => {
    const [transport] = computeTopExpenseRecommendations([
      {
        category: "transport",
        total: 6_600,
        options: [
          { label: "BRT", amount: 3_000 },
          { label: "Matatu", amount: 6_600 },
          { label: "Carpool", amount: 4_500 },
        ],
      },
    ]);

    expect(transport.currentOption.label).toBe("Matatu");
    expect(transport.options[0].label).toBe("Matatu");
  });

  it("falls back to a synthetic current option when options are empty", () => {
    const [custom] = computeTopExpenseRecommendations([
      {
        category: "custom",
        total: 5_000,
        options: [],
      },
    ]);

    expect(custom.currentOption.label).toBe("Current");
    expect(custom.currentOption.amount).toBe(5_000);
    expect(custom.options[0].label).toBe("Current");
  });
});

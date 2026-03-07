export type ExpenseSuggestion = {
  name: string;
  category: "custom";
  suggestedMin: number;
  suggestedMax: number;
  suggestedDefault: number;
};

export const EXPENSE_SUGGESTIONS: readonly ExpenseSuggestion[] = [
  {
    name: "Gym",
    category: "custom",
    suggestedMin: 2_000,
    suggestedMax: 5_000,
    suggestedDefault: 3_000,
  },
  {
    name: "Utilities",
    category: "custom",
    suggestedMin: 1_000,
    suggestedMax: 3_000,
    suggestedDefault: 2_000,
  },
  {
    name: "Internet",
    category: "custom",
    suggestedMin: 2_000,
    suggestedMax: 4_000,
    suggestedDefault: 3_000,
  },
  {
    name: "Groceries",
    category: "custom",
    suggestedMin: 5_000,
    suggestedMax: 15_000,
    suggestedDefault: 8_000,
  },
  {
    name: "Entertainment",
    category: "custom",
    suggestedMin: 2_000,
    suggestedMax: 8_000,
    suggestedDefault: 3_000,
  },
  {
    name: "Savings",
    category: "custom",
    suggestedMin: 5_000,
    suggestedMax: 20_000,
    suggestedDefault: 10_000,
  },
  {
    name: "Phone/Airtime",
    category: "custom",
    suggestedMin: 500,
    suggestedMax: 2_000,
    suggestedDefault: 1_000,
  },
  {
    name: "Clothing",
    category: "custom",
    suggestedMin: 1_000,
    suggestedMax: 5_000,
    suggestedDefault: 2_000,
  },
  {
    name: "Personal Care",
    category: "custom",
    suggestedMin: 500,
    suggestedMax: 2_000,
    suggestedDefault: 1_000,
  },
] as const;

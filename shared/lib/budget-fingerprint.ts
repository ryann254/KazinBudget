export type BudgetFingerprintExpenseItem = {
  name: string;
  amount: number;
  category?: string;
};

export type BudgetFingerprintAssumptions = Record<
  string,
  string | number | boolean | null | undefined
>;

export type BudgetFingerprintInput = {
  grossSalary: number;
  workLocation: string;
  homeArea: string;
  expenseItems: readonly BudgetFingerprintExpenseItem[];
  assumptions?: BudgetFingerprintAssumptions;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function normalizeAssumptions(
  assumptions: BudgetFingerprintAssumptions | undefined,
) {
  if (!assumptions) return [];

  return Object.entries(assumptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => [key, value ?? null] as const);
}

export function createBudgetFingerprint(input: BudgetFingerprintInput): string {
  const normalizedExpenseItems = input.expenseItems
    .map((item) => ({
      name: normalizeText(item.name),
      category: normalizeText(item.category ?? "uncategorized"),
      amount: normalizeNumber(item.amount),
    }))
    .sort((a, b) => {
      const categoryOrder = a.category.localeCompare(b.category);
      if (categoryOrder !== 0) return categoryOrder;

      const nameOrder = a.name.localeCompare(b.name);
      if (nameOrder !== 0) return nameOrder;

      return a.amount - b.amount;
    });

  return JSON.stringify({
    grossSalary: normalizeNumber(input.grossSalary),
    workLocation: normalizeText(input.workLocation),
    homeArea: normalizeText(input.homeArea),
    expenseItems: normalizedExpenseItems,
    assumptions: normalizeAssumptions(input.assumptions),
  });
}

export function hasImpactfulBudgetChange(
  previous: BudgetFingerprintInput,
  next: BudgetFingerprintInput,
): boolean {
  return createBudgetFingerprint(previous) !== createBudgetFingerprint(next);
}

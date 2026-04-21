export type RecommendationOption = {
  label: string;
  amount: number;
  isCurrent?: boolean;
};

export type ExpenseCategoryRecommendationInput = {
  category: string;
  total: number;
  options: readonly RecommendationOption[];
};

export type ExpenseCategoryRecommendation = {
  category: string;
  total: number;
  currentOption: RecommendationOption;
  options: RecommendationOption[];
};

function sortByAmountDescending(
  a: RecommendationOption,
  b: RecommendationOption,
): number {
  if (a.amount !== b.amount) {
    return b.amount - a.amount;
  }
  return a.label.localeCompare(b.label);
}

function getCurrentOption(
  options: readonly RecommendationOption[],
): RecommendationOption | null {
  const explicitCurrent = options.find((option) => option.isCurrent);
  if (explicitCurrent) return explicitCurrent;

  if (options.length === 0) return null;

  return [...options].sort(sortByAmountDescending)[0];
}

function buildOrderedOptions(
  currentOption: RecommendationOption,
  options: readonly RecommendationOption[],
  maxOptions: number,
): RecommendationOption[] {
  const normalizedCurrent = { ...currentOption, isCurrent: true };

  const cheaperOptions = options
    .filter(
      (option) =>
        option !== currentOption &&
        !(option.label === currentOption.label && option.amount === currentOption.amount),
    )
    .filter((option) => option.amount <= currentOption.amount)
    .sort(sortByAmountDescending);

  return [normalizedCurrent, ...cheaperOptions].slice(0, maxOptions);
}

export function computeTopExpenseRecommendations(
  categories: readonly ExpenseCategoryRecommendationInput[],
  maxCategories: number = 2,
  maxOptions: number = 4,
): ExpenseCategoryRecommendation[] {
  const selected = [...categories]
    .sort((a, b) => {
      if (a.total !== b.total) return b.total - a.total;
      return a.category.localeCompare(b.category);
    })
    .slice(0, maxCategories);

  return selected.map((category) => {
    const currentOption =
      getCurrentOption(category.options) ?? {
        label: "Current",
        amount: category.total,
        isCurrent: true,
      };

    const orderedOptions = buildOrderedOptions(
      currentOption,
      category.options,
      maxOptions,
    );

    return {
      category: category.category,
      total: category.total,
      currentOption: { ...currentOption, isCurrent: true },
      options: orderedOptions,
    };
  });
}

import { EXPENSE_SUGGESTIONS } from "@kazibudget/shared/constants/expense-suggestions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuickAddChipsProps = {
  onAdd: (name: string, amount: number) => void;
  existingExpenses?: string[];
};

export function QuickAddChips({
  onAdd,
  existingExpenses = [],
}: QuickAddChipsProps) {
  const existingSet = new Set(
    existingExpenses.map((name) => name.toLowerCase())
  );

  return (
    <div className="flex flex-wrap gap-2">
      {EXPENSE_SUGGESTIONS.map((suggestion) => {
        const exists = existingSet.has(suggestion.name.toLowerCase());

        return (
          <Button
            key={suggestion.name}
            variant="outline"
            size="sm"
            className={cn(exists && "opacity-40 pointer-events-none")}
            disabled={exists}
            onClick={() => onAdd(suggestion.name, suggestion.suggestedDefault)}
          >
            {suggestion.name}
          </Button>
        );
      })}
    </div>
  );
}

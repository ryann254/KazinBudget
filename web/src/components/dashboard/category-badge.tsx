import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category: "tax" | "rent" | "food" | "transport" | "custom";
};

const categoryStyles: Record<CategoryBadgeProps["category"], string> = {
  tax: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  rent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  food: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  transport:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  custom:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", categoryStyles[category])}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}

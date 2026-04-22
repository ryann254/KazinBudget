import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatKES } from "@kazibudget/shared/utils/format-currency";

type ExpenseChartProps = {
  expenses: Array<{ name: string; category: string; amount: number }>;
};

const CATEGORY_COLORS: Record<string, string> = {
  tax: "#ef4444",
  rent: "#3b82f6",
  food: "#f59e0b",
  transport: "#22c55e",
  custom: "#a855f7",
};

const CATEGORY_LABELS: Record<string, string> = {
  tax: "Tax",
  rent: "Rent",
  food: "Food",
  transport: "Transport",
  custom: "Custom",
};

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const aggregated = new Map<string, number>();

    for (const expense of expenses) {
      const current = aggregated.get(expense.category) ?? 0;
      aggregated.set(expense.category, current + expense.amount);
    }

    const data = Array.from(aggregated.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        fill: CATEGORY_COLORS[category] ?? "#6b7280",
      })
    );

    const config: ChartConfig = {};
    for (const [category] of aggregated.entries()) {
      config[category] = {
        label: CATEGORY_LABELS[category] ?? category,
        color: CATEGORY_COLORS[category] ?? "#6b7280",
      };
    }

    return { chartData: data, chartConfig: config };
  }, [expenses]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No expenses to display
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="category"
              formatter={(value) => formatKES(Number(value))}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          outerRadius={90}
          strokeWidth={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="category" />} />
      </PieChart>
    </ChartContainer>
  );
}

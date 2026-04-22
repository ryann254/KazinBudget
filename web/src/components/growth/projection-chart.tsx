import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { YearProjection } from "@kazibudget/shared/lib/projections";
import { formatKES } from "@kazibudget/shared/utils/format-currency";

type ProjectionChartProps = {
  projections: YearProjection[];
  viewMode: "nominal" | "real";
};

const CHART_CONFIG: ChartConfig = {
  salary: {
    label: "Salary",
    color: "#22c55e",
  },
  takeHome: {
    label: "Take-Home",
    color: "#3b82f6",
  },
  totalExpenses: {
    label: "Total Expenses",
    color: "#ef4444",
  },
  totalTax: {
    label: "Taxes",
    color: "#f97316",
  },
};

const MILESTONE_YEARS = [3, 5, 7, 10];

export function ProjectionChart({
  projections,
  viewMode,
}: ProjectionChartProps) {
  const chartData = useMemo(() => {
    return projections.map((p) => ({
      year: p.year,
      salary: p.salary,
      takeHome: viewMode === "real" ? p.takeHomeReal : p.takeHome,
      totalExpenses: p.totalExpenses,
      totalTax: p.totalTax,
    }));
  }, [projections, viewMode]);

  return (
    <ChartContainer config={CHART_CONFIG} className="min-h-[300px] w-full">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tickFormatter={(value: number) => `Y${value}`}
        />
        <YAxis
          tickFormatter={(value: number) => formatKES(value)}
          width={100}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatKES(Number(value))}
              labelFormatter={(label) => `Year ${label}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {MILESTONE_YEARS.map((year) => (
          <ReferenceLine
            key={year}
            x={year}
            stroke="#9ca3af"
            strokeDasharray="4 4"
            label={{ value: `Y${year}`, position: "top", fontSize: 10 }}
          />
        ))}
        <Line
          type="monotone"
          dataKey="salary"
          stroke="var(--color-salary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="takeHome"
          stroke="var(--color-takeHome)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="totalExpenses"
          stroke="var(--color-totalExpenses)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="totalTax"
          stroke="var(--color-totalTax)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

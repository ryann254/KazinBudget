import type { YearProjection } from "@kazibudget/shared/lib/projections";
import { formatKES } from "@kazibudget/shared/utils/format-currency";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MilestoneCardsProps = {
  currentTakeHome: number;
  milestones: {
    year3: YearProjection;
    year5: YearProjection;
    year7: YearProjection;
    year10: YearProjection;
  };
};

type MilestoneEntry = {
  label: string;
  projection: YearProjection;
};

function PercentageChange({
  current,
  projected,
}: {
  current: number;
  projected: number;
}) {
  if (current === 0) {
    return <span className="text-muted-foreground text-sm">N/A</span>;
  }

  const change = ((projected - current) / current) * 100;
  const isPositive = change >= 0;

  return (
    <span
      className={cn(
        "text-sm font-medium",
        isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}
    >
      {isPositive ? "+" : ""}
      {change.toFixed(1)}%
    </span>
  );
}

export function MilestoneCards({
  currentTakeHome,
  milestones,
}: MilestoneCardsProps) {
  const entries: MilestoneEntry[] = [
    { label: "Year 3", projection: milestones.year3 },
    { label: "Year 5", projection: milestones.year5 },
    { label: "Year 7", projection: milestones.year7 },
    { label: "Year 10", projection: milestones.year10 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {entries.map((entry) => (
        <Card key={entry.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {entry.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatKES(entry.projection.takeHome)}
            </p>
            <div className="mt-1">
              <PercentageChange
                current={currentTakeHome}
                projected={entry.projection.takeHome}
              />
              <span className="text-muted-foreground text-xs ml-1">
                vs current
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

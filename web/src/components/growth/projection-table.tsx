import { useMemo } from "react";
import type { YearProjection } from "@kazibudget/shared/lib/projections";
import { formatKES } from "@kazibudget/shared/utils/format-currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ProjectionTableProps = {
  projections: YearProjection[];
  viewMode: "nominal" | "real";
};

type RowDefinition = {
  label: string;
  key: string;
  getValue: (p: YearProjection, viewMode: "nominal" | "real") => number;
  bold?: boolean;
};

const ROW_DEFINITIONS: RowDefinition[] = [
  {
    label: "Gross Salary",
    key: "salary",
    getValue: (p) => p.salary,
  },
  {
    label: "PAYE",
    key: "paye",
    getValue: (p) => p.paye,
  },
  {
    label: "NSSF",
    key: "nssf",
    getValue: (p) => p.nssf,
  },
  {
    label: "SHIF",
    key: "shif",
    getValue: (p) => p.shif,
  },
  {
    label: "Housing Levy",
    key: "housingLevy",
    getValue: (p) => p.housingLevy,
  },
  {
    label: "Rent",
    key: "rent",
    getValue: (p) => p.rent,
  },
  {
    label: "Food",
    key: "food",
    getValue: (p) => p.food,
  },
  {
    label: "Transport",
    key: "transport",
    getValue: (p) => p.transport,
  },
  {
    label: "Custom Expenses",
    key: "customExpenses",
    getValue: (p) => p.customExpenses,
  },
  {
    label: "Take-Home",
    key: "takeHome",
    getValue: (p, viewMode) =>
      viewMode === "real" ? p.takeHomeReal : p.takeHome,
    bold: true,
  },
];

const MILESTONE_YEARS = [0, 3, 5, 7, 10];

export function ProjectionTable({
  projections,
  viewMode,
}: ProjectionTableProps) {
  const milestoneProjections = useMemo(() => {
    const byYear = new Map(projections.map((p) => [p.year, p]));
    return MILESTONE_YEARS.map((year) => byYear.get(year)).filter(
      (p): p is YearProjection => p !== undefined
    );
  }, [projections]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[140px]">Metric</TableHead>
          {milestoneProjections.map((p) => (
            <TableHead key={p.year} className="text-right">
              {p.year === 0 ? "Current" : `Year ${p.year}`}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROW_DEFINITIONS.map((row) => (
          <TableRow key={row.key}>
            <TableCell
              className={cn(row.bold && "font-bold")}
            >
              {row.label}
            </TableCell>
            {milestoneProjections.map((p) => (
              <TableCell
                key={p.year}
                className={cn("text-right", row.bold && "font-bold")}
              >
                {formatKES(row.getValue(p, viewMode))}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

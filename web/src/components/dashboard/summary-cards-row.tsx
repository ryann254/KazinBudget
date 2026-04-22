import { SummaryCard } from "@/components/dashboard/summary-card";

type SummaryCardsRowProps = {
  grossSalary: number;
  totalDeductions: number;
  totalExpenses: number;
  netTakeHome: number;
};

export function SummaryCardsRow({
  grossSalary,
  totalDeductions,
  totalExpenses,
  netTakeHome,
}: SummaryCardsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard title="Gross Salary" amount={grossSalary} variant="default" />
      <SummaryCard
        title="Total Deductions"
        amount={totalDeductions}
        variant="destructive"
      />
      <SummaryCard
        title="Total Expenses"
        amount={totalExpenses}
        variant="destructive"
      />
      <SummaryCard
        title="Net Take-Home"
        amount={netTakeHome}
        variant="success"
      />
    </div>
  );
}

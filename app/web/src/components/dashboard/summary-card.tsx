import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatKES } from "@kazibudget/shared/utils/format-currency";

type SummaryCardProps = {
  title: string;
  amount: number;
  variant: "default" | "destructive" | "success";
};

const variantClasses: Record<SummaryCardProps["variant"], string> = {
  success: "text-green-600 dark:text-green-400",
  destructive: "text-red-600 dark:text-red-400",
  default: "text-foreground",
};

export function SummaryCard({ title, amount, variant }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold", variantClasses[variant])}>
          {formatKES(amount)}
        </p>
      </CardContent>
    </Card>
  );
}

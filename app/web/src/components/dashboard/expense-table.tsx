import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { CreateExpenseData } from "@kazibudget/shared/schemas/expense";
import { formatKES } from "@kazibudget/shared/utils/format-currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { SourceBadge } from "@/components/dashboard/source-badge";
import { ExpenseDialog } from "@/components/dashboard/expense-dialog";

type Expense = {
  _id: string;
  name: string;
  category: string;
  amount: number;
  is_auto: boolean;
  original_amount?: number;
};

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (id: string, data: CreateExpenseData) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  onReset,
}: ExpenseTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground h-24"
            >
              No expenses yet
            </TableCell>
          </TableRow>
        ) : (
          expenses.map((expense) => {
            const isOverriddenAuto =
              expense.is_auto &&
              expense.original_amount !== undefined &&
              expense.original_amount !== expense.amount;

            return (
              <TableRow key={expense._id}>
                <TableCell className="font-medium">{expense.name}</TableCell>
                <TableCell>
                  <CategoryBadge
                    category={
                      expense.category as
                        | "tax"
                        | "rent"
                        | "food"
                        | "transport"
                        | "custom"
                    }
                  />
                </TableCell>
                <TableCell>{formatKES(expense.amount)}</TableCell>
                <TableCell>
                  <SourceBadge isAuto={expense.is_auto} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ExpenseDialog
                      trigger={
                        <Button variant="ghost" size="icon-xs">
                          <Pencil className="size-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      }
                      title="Edit Expense"
                      expense={expense}
                      onSave={(data) => onEdit(expense._id, data)}
                    />

                    {!expense.is_auto && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(expense._id)}
                      >
                        <Trash2 className="size-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}

                    {isOverriddenAuto && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onReset(expense._id)}
                      >
                        <RotateCcw className="size-3" />
                        <span className="sr-only">Reset</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

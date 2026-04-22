import { useState, type ReactNode } from "react";
import type { CreateExpenseData } from "@kazibudget/shared/schemas/expense";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/dashboard/expense-form";

type ExpenseDialogProps = {
  trigger: ReactNode;
  title: string;
  expense?: { name: string; category: string; amount: number };
  onSave: (data: CreateExpenseData) => void;
};

export function ExpenseDialog({
  trigger,
  title,
  expense,
  onSave,
}: ExpenseDialogProps) {
  const [open, setOpen] = useState(false);

  function handleSave(data: CreateExpenseData) {
    onSave(data);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          onSubmit={handleSave}
          defaultValues={
            expense
              ? {
                  name: expense.name,
                  category: expense.category as CreateExpenseData["category"],
                  amount: expense.amount,
                }
              : undefined
          }
          isEdit={!!expense}
        />
      </DialogContent>
    </Dialog>
  );
}

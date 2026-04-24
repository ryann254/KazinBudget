import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createExpenseSchema,
  type CreateExpenseData,
} from "@kazibudget/shared/schemas/expense";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExpenseFormProps = {
  onSubmit: (data: CreateExpenseData) => void;
  defaultValues?: Partial<CreateExpenseData>;
  isEdit?: boolean;
};

const CATEGORY_OPTIONS = [
  { value: "tax", label: "Tax" },
  { value: "rent", label: "Rent" },
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "custom", label: "Custom" },
] as const;

export function ExpenseForm({
  onSubmit,
  defaultValues,
  isEdit = false,
}: ExpenseFormProps) {
  const form = useForm<CreateExpenseData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "custom",
      amount: defaultValues?.amount ?? 0,
    },
  });

  function handleSubmit(data: CreateExpenseData) {
    onSubmit(data);
    if (!isEdit) {
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g., Monthly Rent"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  KES
                </span>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 15000"
                    min={0}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEdit ? "Save Changes" : "Add Expense"}
        </Button>
      </form>
    </Form>
  );
}

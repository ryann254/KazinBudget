import { z } from "zod";

export const expenseCategorySchema = z.enum([
  "tax",
  "rent",
  "food",
  "transport",
  "custom",
]);

export const createExpenseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  category: expenseCategorySchema,
  amount: z
    .number()
    .nonnegative("Amount must be non-negative")
    .max(10_000_000, "Amount must be at most 10,000,000"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseData = z.infer<typeof updateExpenseSchema>;
